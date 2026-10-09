# CivicEase 🇮🇳
### Making Government Schemes Easier to Discover and Access

CivicEase is a data-driven platform designed to simplify access to government welfare schemes by bringing scheme information, eligibility criteria, benefits, required documents, and application details into one place.

Government scheme information is often distributed across multiple portals and presented in different formats. Citizens may struggle to identify relevant schemes, understand eligibility requirements, and determine which documents they need.

CivicEase aims to make this process simpler through a structured, source-verified knowledge base and a rule-based eligibility matching engine.

> **Current stage:** Backend prototype in development. The current implementation uses FastAPI and a JSON-based scheme dataset. PostgreSQL integration and the Next.js frontend are planned.

---

## 🎯 Project Objectives

- **Centralized information:** Organize government schemes in a structured, searchable knowledge base.
- **Personalized discovery:** Match user-provided information against scheme eligibility criteria.
- **Transparent decisions:** Explain which eligibility rules passed, failed, or need further information.
- **Application assistance:** Present required documents, benefits, application methods, and official sources.
- **Verified information:** Track sources and verification dates to support reliable scheme information.

## 💡 Proposed Solution

CivicEase follows a data-centric approach rather than relying on an AI model to make eligibility decisions.

The system is designed around:

1. **Government Knowledge Base** — Structured scheme records containing eligibility criteria, benefits, documents, and official sources.
2. **Rule-Based Eligibility Engine** — Evaluates explicit eligibility conditions using predefined rules.
3. **Eligibility API** — Accepts user profiles and returns scheme-specific results.
4. **Citizen-Facing Interface** — A planned web interface for entering profile details and exploring matching schemes.
5. **Database Layer** — PostgreSQL will eventually replace JSON as the primary source of scheme records.

The eligibility engine is intended to provide explainable results instead of opaque predictions. Actual eligibility remains subject to complete, verified scheme rules and the relevant authority's decision.

---

## 🛠️ Technology Stack

| Component | Technology | Status |
|---|---|---|
| Backend API | Python, FastAPI | Implemented |
| Eligibility engine | Python, rule-based logic | Basic version implemented |
| Prototype dataset | JSON | Implemented |
| API documentation | Swagger UI / OpenAPI | Available through FastAPI |
| Database | PostgreSQL | Planned |
| Frontend | Next.js, React | Planned |
| Styling | Tailwind CSS | Planned |
| Data processing | Pandas, NumPy | Planned for data preparation where required |

---

## 📂 Current Project Structure

```text
CivicEase/
├── Backend/
│   ├── app/
│   │   ├── main.py
│   │   └── Rules.py
│   └── data/
│       └── schemes.json
├── README.md
├── requirements.txt
└── .gitignore
```

*This represents the intended structure of the current backend prototype. Add any additional files or folders present in the actual repository.*

### Key Files

**`Backend/app/main.py`**
- Initializes the FastAPI application.
- Exposes the API endpoints.
- Loads scheme records from the JSON dataset.
- Connects incoming eligibility requests to the rule engine.

**`Backend/app/Rules.py`**
- Compares user profile values against scheme eligibility rules.
- Supports operators such as `equals`, `between`, `greater_than`, and `greater_than_or_equal`.
- Separates passed rules, failed rules, missing information, and unresolved rules.

**`Backend/data/schemes.json`**
- Stores the five initial scheme records.
- Includes scheme descriptions, benefits, eligibility rules, required documents, application methods, and source metadata.

---

## 📋 Implemented Features

### 1. Scheme Retrieval API

**Endpoint:** `GET /schemes`

Retrieves the scheme records stored in `schemes.json`.

The response includes:
- Total number of schemes.
- Scheme information and eligibility criteria.
- Benefits and required documents.
- Official source and application method.

### 2. Eligibility-Check API

**Endpoint:** `POST /eligibility-check`

Accepts a user profile and evaluates it against the available scheme records.

The response includes:
- Scheme ID and name.
- Eligibility status.
- Passed eligibility rules.
- Failed eligibility rules.
- Missing user information.
- Rules requiring further review.
- Required documents and application information.

### 3. Rule-Based Eligibility Matching

The current engine supports basic comparisons, including:

- `equals`
- `greater_than`
- `greater_than_or_equal`
- `less_than`
- `less_than_or_equal`
- `between`
- `allowed`

Missing information is tracked separately from failed conditions. Conditional rules that have not yet been implemented are flagged for further review.

**Current limitation:** The eligibility engine is still under development. Conditional rules, complete scheme criteria, and comprehensive validation need to be implemented before results can be treated as reliable eligibility assessments.

### 4. Interactive API Documentation

FastAPI automatically generates interactive API documentation at:

`http://127.0.0.1:8000/docs`

Developers can inspect endpoints, submit sample requests, and view JSON responses without a separate frontend.

---

## 🗂️ Initial Scheme Dataset

The prototype currently contains five scheme records:

| Scheme | Coverage | Category |
|---|---|---|
| Punyashlok Ahilyadevi Holkar Women Startup Scheme | Maharashtra | Women Entrepreneurship |
| Chief Minister Employment Generation Programme (CMEGP) | Maharashtra | Self Employment |
| Swarnima | Maharashtra | Women Entrepreneurship |
| Prime Minister's Employment Generation Programme (PMEGP) | Central | Self Employment |
| Pradhan Mantri MUDRA Yojana (PMMY) | Central | Micro Enterprise |

These records form the initial prototype dataset, not an exhaustive list of government schemes.

Scheme eligibility criteria, benefits, documents, and source metadata must be checked against current official sources before production use.

---

## 🚧 Development Roadmap

### Phase 1 — Backend Foundation
- [x] Set up FastAPI.
- [x] Create the initial scheme dataset.
- [x] Implement `GET /schemes`.
- [x] Implement `POST /eligibility-check`.
- [x] Implement basic rule comparisons.
- [x] Add handling for missing information and unresolved conditions.
- [ ] Implement and test all conditional eligibility rules.
- [ ] Improve input validation and error handling.
- [ ] Add automated tests for eligible, ineligible, and incomplete profiles.

### Phase 2 — Data and Database
- [ ] Verify scheme criteria against official sources.
- [ ] Finalize the PostgreSQL schema.
- [ ] Migrate the existing JSON records into PostgreSQL.
- [ ] Connect FastAPI to PostgreSQL.
- [ ] Add structured source and verification metadata.
- [ ] Establish a repeatable data validation and update process.

### Phase 3 — Frontend
- [ ] Set up Next.js and Tailwind CSS.
- [ ] Build the home page and scheme discovery interface.
- [ ] Build the user profile and eligibility form.
- [ ] Display matching schemes and explainable eligibility results.
- [ ] Display required documents, benefits, and official application links.
- [ ] Connect the frontend to the FastAPI backend.

### Phase 4 — Integration and Evaluation
- [ ] Integrate frontend, backend, and PostgreSQL.
- [ ] Test end-to-end workflows.
- [ ] Evaluate matching accuracy against manually verified cases.
- [ ] Improve accessibility, responsiveness, and error messages.
- [ ] Prepare deployment and production configuration.

---

## 🚀 Getting Started

### Prerequisites

Install the following software:

- Python 3.10 or newer.
- Git.
- Visual Studio Code or another code editor.

PostgreSQL and Node.js are not required to run the current backend-only prototype. They will be needed for the database and frontend stages, respectively.

### 1. Clone the Repository

Replace `<YOUR-REPOSITORY-URL>` with the GitHub repository URL.

```bash
git clone <YOUR-REPOSITORY-URL>
cd CivicEase
```

### 2. Create a Python Virtual Environment

Run these commands in the project root on Windows:

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use Command Prompt instead:

```bat
.venv\Scripts\activate.bat
```

When activation succeeds, the terminal generally displays `(.venv)` at the beginning of the command line.

### 3. Install Dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the Backend

Navigate to the backend directory:

```bash
cd Backend
```

Start the development server:

```bash
python -m uvicorn app.main:app --reload
```

The API should now be available at:

- **API root:** http://127.0.0.1:8000/
- **Scheme retrieval:** http://127.0.0.1:8000/schemes
- **Eligibility check documentation:** http://127.0.0.1:8000/docs
- **OpenAPI specification:** http://127.0.0.1:8000/openapi.json

Use `/docs` to test the endpoints interactively.

To stop the server, press `Ctrl + C` in the terminal.

---

## 🧪 Testing the API

### Retrieve Schemes

Send a `GET` request to:

```text
http://127.0.0.1:8000/schemes
```

The response should contain the five scheme records from the JSON dataset.

### Check Eligibility

Send a `POST` request to:

```text
http://127.0.0.1:8000/eligibility-check
```

Example request body:

```json
{
  "details": {
    "age": 24,
    "state": "Maharashtra",
    "gender": "female",
    "social_category": "OBC",
    "annual_family_income": 90000,
    "business_sector": "services",
    "enterprise_type": "micro_enterprise",
    "women_ownership_percentage": 60,
    "startup_age_years": 2,
    "annual_turnover": 5000000,
    "new_unit": true,
    "capital_expenditure": 100000,
    "previous_government_subsidy": false
  }
}
```

This is a sample testing profile, not a real applicant assessment. The current engine does not evaluate every conditional requirement.

---

## 🤝 Contributing and Team Workflow

CivicEase is being developed collaboratively. Team members can work on separate parts of the system.

Suggested areas of contribution:

- **Backend:** API endpoints, validation, eligibility logic, automated tests.
- **Database:** PostgreSQL schema, data migration, database integration.
- **Frontend:** Next.js pages, forms, scheme cards, and API integration.
- **Data:** Scheme research, official source verification, eligibility rule structuring.
- **Testing:** Test cases, matching accuracy, edge cases, and end-to-end validation.

### Before Making Changes

1. Pull the latest code from the shared branch.
2. Create a separate branch for your task.
3. Test your changes locally.
4. Commit your changes with a descriptive message.
5. Push your branch and open a pull request.

Example:

```bash
git pull origin main
git checkout -b feature/your-task
git add .
git commit -m "Describe your changes"
git push -u origin feature/your-task
```

Coordinate with the team before changing the scheme JSON structure, API response format, or database schema.

---

## 🔐 Security and Data Integrity

- Never commit passwords, API keys, database credentials, or private configuration files.
- Keep local virtual environments and Python cache files out of Git.
- Use environment variables for credentials when database integration is introduced.
- Prefer official government sources for scheme information.
- Track the source and last verification date for each scheme.
- Do not treat prototype results as final government eligibility decisions.
- Avoid committing real applicants' personal or financial information.

---

## 📌 Current Status

CivicEase currently has a functional local FastAPI backend with JSON-based scheme retrieval and a basic rule-based eligibility-check endpoint.

The next priorities are completing conditional eligibility rules, verifying the scheme dataset, integrating PostgreSQL, and developing the Next.js frontend.

**CivicEase — Making public benefits easier to discover, understand, and access.**
