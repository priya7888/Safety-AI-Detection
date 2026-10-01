import sqlite3
from datetime import datetime

for db_path in ['safety_intelligence.db', 'backend/safety_intelligence.db']:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

# Delete existing safety_reports, ai_analyses, feedbacks for id001 to guarantee exact 5 clean reports for today
c.execute("DELETE FROM feedbacks WHERE organization_id = 'id001'")
c.execute("DELETE FROM ai_analyses WHERE organization_id = 'id001'")
c.execute("DELETE FROM safety_reports WHERE organization_id = 'id001'")
conn.commit()

today = "2026-09-06"

reports_data = [
    {
        "ref": "REP-ID001-0001",
        "type": "NEAR_MISS",
        "desc": "During crane hoisting operation at Rig 04 Derrick Floor, a 4-inch heavy steel drilling flange slipped from the rigging sling at a height of 18 meters and fell 2 meters away from two roughnecks positioning casing pipe. No exclusion zone barricade was established around the drop zone.",
        "loc": "Drilling Rig 04 – Derrick Floor Area",
        "hazard": "Suspended Load & Dropped Object Hazard (Gravity / High Energy)",
        "sif": "YES",
        "energy": "Gravity (High elevation potential energy / falling mass)",
        "barrier": "BARRIER_FAILED",
        "signal": "Personnel positioned within active suspended load drop zone",
        "consequence": "Potential blunt force trauma or fatality from falling heavy mass",
        "action": "Erect physical drop zone barricades and inspect all sling rigging"
    },
    {
        "ref": "REP-ID001-0002",
        "type": "UNSAFE_ACT",
        "desc": "Maintenance technician observed entering high-voltage 11kV electrical substation switchgear room to perform circuit breaker inspection without conducting Lock-Out/Tag-Out (LOTO) energy isolation or verifying zero-energy state with a calibrated voltage detector.",
        "loc": "Central Processing Facility – Main Substation A",
        "hazard": "Electrical Arc Flash & Shock Hazard (Electrical Energy)",
        "sif": "YES",
        "energy": "Electrical Energy (Live high-voltage circuit / arc flash potential)",
        "barrier": "BARRIER_MISSING",
        "signal": "Unisolated high-voltage panel access without LOTO locks",
        "consequence": "Potential high-voltage electrical shock or severe arc flash thermal burns",
        "action": "Immediate stop work; enforce mandatory zero-energy verification"
    },
    {
        "ref": "REP-ID001-0003",
        "type": "UNSAFE_CONDITION",
        "desc": "Missing grating section (approx 1.5m x 0.8m) on high elevation walkway (Level 3 process platform) above hydrocarbon separation vessel. Open void was left completely unbarricaded and without caution signage.",
        "loc": "Hydrocarbon Separation Unit – Level 3 Walkway",
        "hazard": "Working at Heights & Open Void Fall Hazard (Gravity)",
        "sif": "YES",
        "energy": "Gravity / Fall from Height (> 6 meters elevation)",
        "barrier": "BARRIER_MISSING",
        "signal": "Unguarded edge or floor opening lacking compliant physical barrier",
        "consequence": "Potential fatal fall from elevated process platform",
        "action": "Install solid scaffolding cover and lock out walkway access"
    },
    {
        "ref": "REP-ID001-0004",
        "type": "UNSAFE_CONDITION",
        "desc": "Slow acid drum flange drip with minor seal corrosion inside secondary chemical containment bay. Acid absorbent pads deployed and drum valve closed. Containment bund 100% intact.",
        "loc": "Chemical Storage & Handling Bay 2",
        "hazard": "Chemical Containment Drip (Low Energy)",
        "sif": "NO",
        "energy": "Chemical (Contained / Low Volume Drip)",
        "barrier": "BARRIER_EFFECTIVE",
        "signal": "Secondary containment bund barrier intact; absorbent pads deployed",
        "consequence": "Minor local surface discoloration; zero worker exposure",
        "action": "Replace flange gasket during routine scheduled maintenance"
    },
    {
        "ref": "REP-ID001-0005",
        "type": "UNSAFE_ACT",
        "desc": "Heavy forklift operator observed reversing at speed through warehouse receiving corridor without sounding horn or using pedestrian spotter at the blind corner intersection.",
        "loc": "Central Warehouse – Receiving Corridor",
        "hazard": "Mobile Equipment & Vehicle-Pedestrian Interaction (Kinetic Energy)",
        "sif": "YES",
        "energy": "Kinetic Energy (Heavy moving industrial vehicle)",
        "barrier": "BARRIER_BYPASSED",
        "signal": "Bypassed blind corner pedestrian acoustic warning",
        "consequence": "Potential high-momentum crush injury to crossing personnel",
        "action": "Install panoramic dome mirror and enforce 5 km/h warehouse speed limit"
    }
]

def seed_db(db_path):
    print(f"Seeding {db_path}...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("DELETE FROM feedbacks WHERE organization_id = 'id001'")
    c.execute("DELETE FROM ai_analyses WHERE organization_id = 'id001'")
    c.execute("DELETE FROM safety_reports WHERE organization_id = 'id001'")
    conn.commit()

    for idx, item in enumerate(reports_data, start=1):
        c.execute("""
        INSERT INTO safety_reports (id, report_reference, organization_id, user_id, report_type, description, location, report_date, additional_context, analysis_status, created_at, updated_at)
        VALUES (?, ?, 'id001', 1, ?, ?, ?, ?, '', 'COMPLETED', datetime('now'), datetime('now'))
        """, (idx, item["ref"], item["type"], item["desc"], item["loc"], today))
        
        explanation = f"{'Potential SIF Precursor identified by AI safety engine.' if item['sif'] == 'YES' else 'Non-SIF observation.'} Hazard: {item['hazard']}. Energy Vector: {item['energy']}. Recommended Defense: {item['action']}."
        
        c.execute("""
        INSERT INTO ai_analyses (id, report_id, organization_id, analysis_context, identified_action, identified_condition, identified_event, identified_hazard, safety_signals, energy_source, exposure, barrier_information, potential_consequence, sif_precursor_assessment, explanation, created_at, updated_at)
        VALUES (?, ?, 'id001', 'Context evaluated for industrial safety', '', '', '', ?, ?, ?, 'Direct personnel exposure', ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (idx, idx, item["hazard"], f'["{item["signal"]}"]', item["energy"], item["barrier"], item["consequence"], item["sif"], explanation))

    c.execute("""
    INSERT INTO feedbacks (id, report_id, organization_id, user_id, feedback_status, feedback_text, created_at)
    VALUES (1, 1, 'id001', 1, 'CORRECT', 'Confirmed SIF Precursor. Immediate drop-zone barricades instituted.', datetime('now'))
    """)
    conn.commit()

    c.execute("SELECT COUNT(*) FROM safety_reports WHERE organization_id = 'id001'")
    print("Total safety_reports for id001:", c.fetchone()[0])
    conn.close()

seed_db('safety_intelligence.db')
seed_db('backend/safety_intelligence.db')

