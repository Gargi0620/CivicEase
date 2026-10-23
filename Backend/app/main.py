
import json
import logging
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

from app.Database import get_connection
from app.Rules import check_scheme_eligibility

from app.Rules import (
    check_scheme_eligibility,
    profile_matches_scheme,
)


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent.parent
SCHEMES_FILE = BACKEND_DIR / "data" / "schemes.json"

load_dotenv(BACKEND_DIR / ".env")

app = FastAPI(title="CivicEase API")


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


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    language: str = "en"
    page: str = "/"
    history: list[ChatMessage] = Field(default_factory=list)


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
            "schemes": schemes,
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
# PostgreSQL-based personalised eligibility matching
# --------------------------------------------------

@app.post("/eligibility-check")
def eligibility_check(profile: UserProfile):
    answers = profile.details or {}

    # Map questionnaire values to stable backend field names.
    applicant_profile = {
        **answers,
        "business_stage": answers.get("stage"),
        "business_type": (
            answers.get("otherBusiness")
            if answers.get("businessType") == "Other"
            else answers.get("businessType")
        ),
        "beneficiary_category": answers.get("beneficiaryCategory"),
        "annual_family_income": answers.get("annualFamilyIncome"),
        "ownership_type": answers.get("ownershipType"),
        "applicant_type": answers.get("applicantType"),
        "state": answers.get("state") or answers.get("location"),
        "district": answers.get("district"),
        "age_group": answers.get("age"),
        "education": answers.get("education"),
        "is_registered": answers.get("isRegistered"),
        "registrations": answers.get("registrations"),
        "support_needs": answers.get("supportNeeds"),
        "funding_range": answers.get("fundingRange"),
    }

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT *
                    FROM public.schemes
                    ORDER BY scheme_id
                    """
                )
                schemes = cur.fetchall()

    except psycopg.Error:
        logging.exception(
            "Could not retrieve schemes for eligibility matching"
        )
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve schemes for matching.",
        )

    results = []

    for scheme in schemes:
        scheme = dict(scheme)
        rules = scheme.get("eligibility_rules")

        # If structured rules exist, use them for eligibility evaluation.
        if rules:
            evaluation_scheme = {
                **scheme,
                "eligibility_rules": rules,
            }

            evaluation = check_scheme_eligibility(
                applicant_profile,
                evaluation_scheme,
            )

            # Never recommend a scheme that has a definite failed rule.
            if evaluation["status"] == "not_eligible":
                continue

            results.append({
                **scheme,
                **evaluation,
                "match_type": "rule_based",
                "match_reasons": [
                    item["reason"]
                    for item in evaluation["passed_rules"]
                ],
            })

        else:
            # Until verified structured rules exist, show only schemes
            # with a preliminary business-profile match.
            matched, reasons = profile_matches_scheme(
                applicant_profile,
                scheme,
            )

            if not matched:
                continue

            results.append({
                **scheme,
                "status": "needs_review",
                "eligible": None,
                "match_type": "preliminary",
                "match_reasons": reasons,
                "passed_rules": [],
                "failed_rules": [],
                "missing_rules": [],
                "review_rules": [{
                    "field": "eligibility_rules",
                    "reason": (
                        "This is a preliminary profile match. "
                        "Scheme-specific eligibility rules still need "
                        "verification."
                    ),
                }],
            })

    return {
        "total_schemes_checked": len(schemes),
        "total_matches": len(results),
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
