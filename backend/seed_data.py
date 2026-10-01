"""
Seed the database with the bundled sample reports so the dashboard has
data to display immediately after setup.

Run from the backend/ directory (with venv active and DATABASE_URL set):

    python seed_data.py
"""
import os
import pandas as pd

from app.database import Base, engine, SessionLocal
from app import models  # noqa: F401
from app.services.report_processing_service import process_and_store_report

CSV_PATH = os.path.join(os.path.dirname(__file__), "sample_data", "sample_reports.csv")


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        df = pd.read_csv(CSV_PATH)
        count = 0
        for _, row in df.iterrows():
            def clean(val):
                if pd.isna(val):
                    return None
                val = str(val).strip()
                return val or None

            process_and_store_report(
                db,
                report_text=str(row["report_text"]).strip(),
                report_type=str(row["report_type"]).strip(),
                site=clean(row.get("site")),
                location=clean(row.get("location")),
                activity=clean(row.get("activity")),
            )
            count += 1
        db.commit()
        print(f"Seeded {count} sample reports.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
