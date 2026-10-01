# SIF Precursor Detection Engine

An AI/NLP engine that analyzes free-text **Unsafe Act (UA)**, **Unsafe Condition (UC)**, and
**Near-Miss** safety reports to detect **Serious Injury & Fatality (SIF)** precursors, extract
key safety information, map reports to **IOGP Life-Saving Rules**, and surface recurring risk
patterns on an interactive dashboard.

Built for the Smart India Hackathon problem statement: *"AI/NLP Engine to Detect Serious Injury
& Fatality (SIF) Precursors in Unsafe Act, Unsafe Condition, and Near-Miss Reports."*

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React + Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend    | Python, FastAPI, Uvicorn, Pydantic |
| Database   | PostgreSQL + SQLAlchemy |
| NLP / ML   | scikit-learn (TF-IDF + Logistic Regression), regex/keyword-based extraction |
| Data       | Pandas (CSV processing) |

---

## Project Structure

```
sif-app/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app entrypoint
│   │   ├── database.py            # SQLAlchemy engine/session
│   │   ├── models/                # SafetyReport, LifeSavingRule, ReportRuleMapping
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── routers/                # /api/reports, /api/analytics
│   │   ├── services/                # extraction, rule mapping, explanation,
│   │   │                             pattern analysis, analytics, orchestration
│   │   └── ml/                     # preprocessing, TF-IDF + LogisticRegression
│   │       ├── data/sample_training_data.csv
│   │       └── train_model.py
│   ├── sample_data/sample_reports.csv   # CSV for testing bulk upload
│   ├── seed_data.py               # loads sample data straight into the DB
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/            # Sidebar, Navbar, SummaryCard, ChartCard,
    │   │                             ReportForm, AnalysisResult, ReportTable, ...
    │   ├── pages/                 # Dashboard, AnalyzeReport, BulkUpload,
    │   │                             ReportHistory, ReportDetails
    │   └── services/api.js        # Axios client
    ├── package.json
    └── .env.example
```

---

## 1. Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL 13+ running locally (or a connection string to a remote instance)

### Steps

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string, e.g.:
# DATABASE_URL=postgresql://sif_user:sif_password@localhost:5432/sif_db

# Create the database and user (example using psql)
psql -U postgres -c "CREATE USER sif_user WITH PASSWORD 'sif_password';"
psql -U postgres -c "CREATE DATABASE sif_db OWNER sif_user;"

# Run the API server (tables are created automatically on startup)
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive API docs (Swagger UI) are at
`http://localhost:8000/docs`.

### (Optional) Seed sample data

To populate the database with 15 sample reports so the dashboard has data immediately:

```bash
python seed_data.py
```

### (Optional) Retrain the ML model

The TF-IDF + Logistic Regression classifier trains automatically from
`app/ml/data/sample_training_data.csv` the first time the API runs (saved to
`app/ml/model_artifacts/`). To retrain manually — e.g. after editing the sample dataset, or to
swap in a larger real dataset with the same two columns (`report_text`, `sif_potential`):

```bash
python -m app.ml.train_model
```

> **Note on quick local testing without PostgreSQL:** you can point `DATABASE_URL` at a SQLite
> file instead (e.g. `sqlite:///./dev.db`) to try the app out without installing Postgres. Use a
> real PostgreSQL database for anything beyond local experimentation, per the problem
> requirements.

---

## 2. Frontend Setup

### Prerequisites
- Node.js 18+

### Steps

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if your backend runs somewhere other than http://localhost:8000

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

---

## 3. Using the Application

1. **Dashboard** (`/`) — summary cards, SIF vs Non-SIF distribution, SIF Precursor Density by
   site/activity, Life-Saving Rule distribution, and recurring barrier failures. Populates once
   reports have been analyzed (via manual entry or CSV upload).
2. **Analyze Report** (`/analyze`) — submit a single report's text, type, and optional
   site/location/activity/date for instant SIF classification and analysis.
3. **Bulk Upload** (`/upload`) — upload a CSV of multiple reports for batch processing. A sample
   file is provided at `backend/sample_data/sample_reports.csv`.
4. **Report History** (`/reports`) — searchable, filterable, paginated table of all analyzed
   reports.
5. **Report Details** (`/reports/:id`) — full AI analysis breakdown for a single report,
   including a plain-English rule-based explanation.

### CSV format for bulk upload

```csv
report_text,report_type,site,location,activity
Worker performed maintenance without isolating electrical energy.,Unsafe Act,Site A,Electrical Room,Maintenance
```

- Required columns: `report_text`, `report_type` (`Unsafe Act` | `Unsafe Condition` | `Near Miss`)
- Optional columns: `site`, `location`, `activity`

---

## 4. API Reference

| Method | Endpoint                       | Description |
|--------|---------------------------------|--------------|
| POST   | `/api/reports/analyze`          | Analyze and store a single report |
| GET    | `/api/reports`                  | List reports (supports `search`, `sif_status`, `report_type`, `site`, `skip`, `limit`) |
| GET    | `/api/reports/{id}`             | Get full details for one report |
| POST   | `/api/reports/upload`           | Bulk CSV upload |
| GET    | `/api/analytics/dashboard`      | Aggregated analytics for the dashboard |

Full interactive documentation is available at `/docs` once the backend is running.

---

## 5. ML / NLP Architecture

```
Input Safety Report
        │
        ▼
Text Preprocessing (lowercase, tokenize, stopword removal)
        │
        ▼
TF-IDF Vectorization
        │
        ▼
Logistic Regression → SIF Potential (YES/NO) + Confidence Score
        │
        ▼
Information Extraction (regex/keyword rules) → Activity, Location, Barrier Failure
        │
        ▼
IOGP Life-Saving Rule Mapping (configurable rule dictionaries)
        │
        ▼
Rule-based Explanation Generation
        │
        ▼
Stored in PostgreSQL → Pattern Analytics → SIF Precursor Density → Dashboard
```

The classifier is intentionally simple for this MVP (a small hand-labeled sample dataset of ~50
reports). Because ML logic, rule-based logic, data processing, and API logic are kept in
separate, isolated modules (`app/ml/`, `app/services/`), the classifier can be swapped for a
better-trained model later — or for a spaCy-based NER pipeline for extraction — without touching
the rest of the application.

---

## 6. IOGP Life-Saving Rules Covered (MVP)

1. Energy Isolation
2. Confined Space
3. Hot Work
4. Line of Fire
5. Working at Height
6. Lifting Operations

Add more rules by extending `LIFE_SAVING_RULES` in `backend/app/services/rule_mapping_service.py`.

---

## 7. Notes

- This is an MVP: no authentication, notifications, or advanced cloud services are included, by
  design, per the problem statement's scope.
- The sample ML training data and sample reports are for demonstration only — replace them with
  real, larger datasets for production use.
