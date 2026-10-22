
import json
import logging
import os
from pathlib import Path

import psycopg
from psycopg.types.json import Jsonb
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field, EmailStr
from pwdlib import PasswordHash


from app.Database import get_connection
from app.Rules import check_scheme_eligibility


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent.parent
SCHEMES_FILE = BACKEND_DIR / "data" / "schemes.json"

load_dotenv(BACKEND_DIR / ".env")

app = FastAPI(title="CivicEase API")
password_hash = PasswordHash.recommended()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    session_cookie="civicease_session",
    same_site="lax",
    https_only=False,  # Local development only before deploying publicly switch to only
    max_age=60 * 60 * 24 * 7,  # 7 days
)



# --------------------------------------------------
# CORS configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Shared scheme data loader
# --------------------------------------------------

def load_schemes():
    if not SCHEMES_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Scheme data file not found.",
        )

    try:
        with SCHEMES_FILE.open("r", encoding="utf-8") as file:
            schemes = json.load(file)
    except (json.JSONDecodeError, OSError):
        raise HTTPException(
            status_code=500,
            detail="Could not read the scheme data.",
        )

    if isinstance(schemes, dict):
        schemes = schemes.get("schemes")

    if not isinstance(schemes, list):
        raise HTTPException(
            status_code=500,
            detail="Expected a list of schemes.",
        )

    return schemes


# --------------------------------------------------
# Request models
# --------------------------------------------------

class UserProfile(BaseModel):
    details: dict

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    language: str = "en"
    page: str = "/"
    history: list[ChatMessage] = Field(default_factory=list)


# --------------------------------------------------
# Authentication endpoints
# --------------------------------------------------

@app.post("/auth/signup", status_code=201)
def signup(data: SignupRequest):
    email = str(data.email).strip().lower()
    hashed_password = password_hash.hash(data.password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (email, password_hash)
                    VALUES (%s, %s)
                    RETURNING user_id, email
                    """,
                    (email, hashed_password),
                )
                user = cur.fetchone()

        return {
            "message": "Account created successfully.",
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
            },
        }

    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )
    except psycopg.Error:
        logging.exception("Signup database operation failed")
        raise HTTPException(
            status_code=500,
            detail="Could not create the account.",
        )


@app.post("/auth/login")
def login(data: LoginRequest, request: Request):
    email = str(data.email).strip().lower()

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT user_id, email, password_hash
                    FROM users
                    WHERE email = %s
                    """,
                    (email,),
                )
                user = cur.fetchone()

    except psycopg.Error:
        logging.exception("Login database operation failed")
        raise HTTPException(
            status_code=500,
            detail="Could not log in right now.",
        )

    if not user or not password_hash.verify(
        data.password, user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    request.session.clear()
    request.session["user_id"] = user["user_id"]

    return {
        "message": "Login successful.",
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
        },
    }


@app.get("/auth/me")
def current_user(request: Request):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="You are not logged in.",
        )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT user_id, email
                    FROM users
                    WHERE user_id = %s
                    """,
                    (user_id,),
                )
                user = cur.fetchone()

    except psycopg.Error:
        logging.exception("Session user lookup failed")
        raise HTTPException(
            status_code=500,
            detail="Could not verify the session.",
        )

    if not user:
        request.session.clear()
        raise HTTPException(
            status_code=401,
            detail="Your account could not be found.",
        )

    return {"user": user}


@app.post("/auth/logout")
def logout(request: Request, response: Response):
    request.session.clear()
    response.delete_cookie(
        key="civicease_session",
        path="/",
        httponly=True,
        secure=False,  # Local development only
        samesite="lax",
    )
    return {"message": "Logged out successfully."}


# --------------------------------------------------
# User profile: save and retrieve questionnaire answers
# --------------------------------------------------

@app.get("/profile")
def get_profile(request: Request):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in to view your profile.",
        )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT details, updated_at
                    FROM user_profiles
                    WHERE user_id = %s
                    """,
                    (user_id,),
                )
                profile = cur.fetchone()

        if profile is None:
            return {"details": {}, "saved": False}

        return {
            "details": profile["details"],
            "saved": True,
            "updated_at": profile["updated_at"],
        }

    except psycopg.Error:
        logging.exception("Could not retrieve user profile")
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve your profile.",
        )


@app.put("/profile")
def save_profile(profile: UserProfile, request: Request):
    user_id = request.session.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in to save your profile.",
        )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_profiles (user_id, details)
                    VALUES (%s, %s)
                    ON CONFLICT (user_id)
                    DO UPDATE SET
                        details = EXCLUDED.details,
                        updated_at = NOW()
                    RETURNING details, updated_at
                    """,
                    (user_id, Jsonb(profile.details)),
                )
                saved_profile = cur.fetchone()

        return {
            "message": "Profile saved successfully.",
            "details": saved_profile["details"],
            "updated_at": saved_profile["updated_at"],
        }

    except psycopg.Error:
        logging.exception("Could not save user profile")
        raise HTTPException(
            status_code=500,
            detail="Could not save your profile.",
        )


# --------------------------------------------------
# Basic endpoints
# --------------------------------------------------

@app.get("/")
def home():
    return {"message": "CivicEase API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}



# --------------------------------------------------
# PostgreSQL: retrieve all schemes
# --------------------------------------------------

def format_scheme(row: dict) -> dict:
    """Map database column names to the frontend's expected fields."""
    return {
        **row,
        "name": row.get("scheme_name") or row.get("name"),
        "level": row.get("scheme_level") or row.get("level"),
        "eligibility_rules": (
            row.get("eligibility_criteria")
            or row.get("eligibility_rules")
        ),
        "required_documents": (
            row.get("documents_required")
            or row.get("required_documents")
        ),
        "official_link": (
            row.get("application_url")
            or row.get("official_source_url")
            or row.get("official_link")
        ),
        "description": row.get("description") or "",
    }


@app.get("/schemes")
def get_schemes():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM schemes ORDER BY scheme_id"
                )
                schemes = cur.fetchall()

        return {
            "total": len(schemes),
            "schemes": [format_scheme(dict(s)) for s in schemes],
        }

    except psycopg.Error:
        logging.exception("Could not retrieve schemes from PostgreSQL")
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve schemes from the database.",
        )


# --------------------------------------------------
# PostgreSQL: search schemes
# --------------------------------------------------

@app.get("/schemes/search")
def search_schemes(q: str):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT *
                    FROM schemes
                    WHERE scheme_name ILIKE %s
                       OR benefits ILIKE %s
                    ORDER BY scheme_id
                    """,
                    (f"%{q}%", f"%{q}%"),
                )
                schemes = cur.fetchall()

        return {
            "query": q,
            "total": len(schemes),
            "schemes": schemes,
        }

    except psycopg.Error:
        logging.exception("Could not search schemes in PostgreSQL")
        raise HTTPException(
            status_code=500,
            detail="Could not search schemes.",
        )


# --------------------------------------------------
# PostgreSQL: match schemes by business details
# --------------------------------------------------

@app.get("/schemes/match")
def match_schemes(stage: str, business_type: str):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT *
                    FROM schemes
                    WHERE business_stage ILIKE %s
                      AND business_type ILIKE %s
                    ORDER BY scheme_id
                    """,
                    (f"%{stage}%", f"%{business_type}%"),
                )
                schemes = cur.fetchall()

        return {
            "profile": {
                "business_stage": stage,
                "business_type": business_type,
            },
            "total": len(schemes),
            "schemes": schemes,
        }

    except psycopg.Error:
        logging.exception("Could not match schemes in PostgreSQL")
        raise HTTPException(
            status_code=500,
            detail="Could not match schemes.",
        )


# --------------------------------------------------
# JSON-based eligibility checker
# --------------------------------------------------

@app.post("/eligibility-check")
def eligibility_check(profile: UserProfile):
    schemes = load_schemes()
    results = []

    for scheme in schemes:
        result = check_scheme_eligibility(
            profile.details,
            scheme,
        )

        results.append({
            "scheme_id": scheme["scheme_id"],
            "name": scheme["name"],
            **result,
            "required_documents": scheme.get(
                "required_documents", []
            ),
            "official_source": scheme.get("official_source"),
            "application_method": scheme.get("application_method"),
        })

    return {
        "total_schemes_checked": len(results),
        "results": results,
    }


# --------------------------------------------------
# Read schemes directly from JSON
# --------------------------------------------------

@app.get("/schemes/json")
def get_json_schemes():
    schemes = load_schemes()

    return {
        "total": len(schemes),
        "schemes": schemes,
    }


# --------------------------------------------------
# Groq-powered CivicEase chatbot
# --------------------------------------------------

@app.post("/chat")
def chat(request: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is missing from Backend/.env",
        )

    # Load scheme data without requiring PostgreSQL.
    schemes = load_schemes()

    language_names = {
        "en": "English",
        "hi": "Hindi",
        "mr": "Marathi",
    }

    language_name = language_names.get(
        request.language,
        "the language used by the user",
    )

    # Keep recent, valid conversation messages.
    history = []

    for item in request.history[-8:]:
        if item.role in ("user", "assistant"):
            history.append({
                "role": item.role,
                "content": item.content[:2000],
            })

    instructions = f"""
You are CivicEase Assistant, a helpful guide to government schemes
and public services in India, especially Maharashtra and women
entrepreneurs.

Respond in {language_name}.

The current website page is: {request.page}

Use the supplied scheme data as your primary source for scheme names,
eligibility, benefits, required documents, and application procedures.

Explain information in simple, accessible language with clear steps.

For questions about other public services, provide general guidance
when possible. Do not invent eligibility criteria, fees, deadlines,
official links, or guarantees of approval. If a fact is unknown,
say so clearly and recommend checking the relevant official source.

Never claim that you have submitted an application or verified a
person's eligibility unless that action actually occurred.
"""

    user_input = f"""
AVAILABLE GOVERNMENT SCHEME DATA:
{json.dumps(schemes, ensure_ascii=False)}

CURRENT USER QUESTION:
{request.message}

Answer the current question using the scheme data above.
"""

    messages = [
        {"role": "system", "content": instructions},
        *history,
        {"role": "user", "content": user_input},
    ]

    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
        )

        reply = (
            response.choices[0].message.content or ""
        ).strip()

        if not reply:
            raise HTTPException(
                status_code=502,
                detail="The AI returned an empty response.",
            )

        return {"reply": reply}

    except HTTPException:
        raise

    except Exception:
        logging.exception("CivicEase chat request failed")

        raise HTTPException(
            status_code=502,
            detail="The chatbot could not generate a response.",
        )
