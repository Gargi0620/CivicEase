
from pathlib import Path
import json

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

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


@app.get("/schemes")
def get_schemes():
    schemes = load_schemes()
    return {
        "total": len(schemes),
        "schemes": schemes
    }


@app.post("/eligibility-check")
def eligibility_check(profile: UserProfile):
    schemes = load_schemes()
    results = []

    for scheme in schemes:
        result = check_scheme_eligibility(
            profile.details,
            scheme
        )

        results.append({
            "scheme_id": scheme["scheme_id"],
            "name": scheme["name"],
            **result,
            "required_documents": scheme.get(
                "required_documents", []
            ),
            "official_source": scheme.get("official_source"),
            "application_method": scheme.get("application_method")
        })

    return {
        "total_schemes_checked": len(results),
        "results": results
    }
