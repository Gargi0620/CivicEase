
from pathlib import Path
import json

import psycopg
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.Database import get_connection
from app.Rules import check_scheme_eligibility

app = FastAPI(title="CivicEase API")

SCHEMES_FILE = (
    Path(__file__).resolve().parent.parent / "data" / "schemes.json"
)


def load_schemes():
    if not SCHEMES_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Scheme data file not found."
        )

    try:
        with SCHEMES_FILE.open("r", encoding="utf-8") as file:
            schemes = json.load(file)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Invalid JSON in schemes.json."
        )

    if isinstance(schemes, dict):
        schemes = schemes.get("schemes")

    if not isinstance(schemes, list):
        raise HTTPException(
            status_code=500,
            detail="Expected a list of schemes."
        )

    return schemes


class UserProfile(BaseModel):
    details: dict


@app.get("/")
def home():
    return {"message": "CivicEase API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# PostgreSQL: retrieve all schemes
@app.get("/schemes")
def get_schemes():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM schemes ORDER BY scheme_id")
                schemes = cur.fetchall()

        return {"total": len(schemes), "schemes": schemes}

    except psycopg.Error:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve schemes from the database."
        )


# PostgreSQL: search by scheme name or benefits
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
                    (f"%{q}%", f"%{q}%")
                )
                schemes = cur.fetchall()

        return {
            "query": q,
            "total": len(schemes),
            "schemes": schemes
        }

    except psycopg.Error:
        raise HTTPException(
            status_code=500,
            detail="Could not search schemes."
        )


# PostgreSQL: match by business stage and type
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
                    (f"%{stage}%", f"%{business_type}%")
                )
                schemes = cur.fetchall()

        return {
            "profile": {
                "business_stage": stage,
                "business_type": business_type
            },
            "total": len(schemes),
            "schemes": schemes
        }

    except psycopg.Error:
        raise HTTPException(
            status_code=500,
            detail="Could not match schemes."
        )


# Existing JSON-based eligibility checker
@app.post("/eligibility-check")
def eligibility_check(profile: UserProfile):
    schemes = load_schemes()
    results = []

    for scheme in schemes:
        result = check_scheme_eligibility(profile.details, scheme)

        results.append({
            "scheme_id": scheme["scheme_id"],
            "name": scheme["name"],
            **result,
            "required_documents": scheme.get("required_documents", []),
            "official_source": scheme.get("official_source"),
            "application_method": scheme.get("application_method")
        })

    return {
        "total_schemes_checked": len(results),
        "results": results
    }


# Access the original JSON dataset directly when needed
@app.get("/schemes/json")
def get_json_schemes():
    schemes = load_schemes()
    return {"total": len(schemes), "schemes": schemes}
