import sqlite3

conn = sqlite3.connect('backend/safety_intelligence.db')
c = conn.cursor()
c.execute("UPDATE ai_analyses SET sif_precursor_assessment = 'NO', explanation = 'Non-SIF observation. Chemical drip was contained within secondary containment bay, absorbent pads were deployed, and drum valve was secured. Low acute exposure potential and barriers functioned adequately.' WHERE report_id = 4")
conn.commit()

c.execute("""
SELECT r.id, r.report_reference, r.report_type, r.report_date, a.sif_precursor_assessment, a.identified_hazard 
FROM safety_reports r 
JOIN ai_analyses a ON r.id = a.report_id
""")
rows = c.fetchall()
print(f"Total rows: {len(rows)}")
for r in rows:
    print(r)
conn.close()
