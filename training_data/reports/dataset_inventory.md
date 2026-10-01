# Historical Safety Datasets Inventory & Field Governance

This inventory establishes the provenance, structure, safety relevance, and governance constraints for the external historical datasets provided for the **Safety Intelligence Platform (SIH 2026 PS 165)**.

> [!IMPORTANT]
> **Source Separation Mandate**: These external historical datasets originate from OSHA, PHMSA, and IOGP. They are strictly designated for NLP training, reference comparison, energy/barrier taxonomy development, and evaluation. They are **NEVER** merged with OIL operational safety reports or presented as OIL records.

---

## 1. Dataset Profiles

### 1.1 OSHA Severe Injury Reports (2015–2025)
- **Filename**: January2015toNovember2025.csv
- **Source**: Occupational Safety and Health Administration (OSHA, US Department of Labor)
- **File Type**: CSV (Comma-Separated Values)
- **Total Records**: 105,996 records
- **Total Columns**: 28 columns
- **Date Range**: 1/1/2015 to 9/9/2025
- **Available Fields**:
  ID, UPA, EventDate, Employer, Address1, Address2, City, State, Zip, Latitude, Longitude, Primary NAICS, Hospitalized, Amputation, Loss of Eye, Inspection, Final Narrative, Nature, NatureTitle, Part of Body, Part of Body Title, Event, EventTitle, Source, SourceTitle, Secondary Source, Secondary Source Title, FederalState
- **Missing Values Analysis**:
  - Final Narrative: 0 missing (0.00%)
  - Hospitalized: 0 missing
  - Amputation: 7 missing
  - Loss of Eye: 5 missing
- **Possible Severity Labels**:
  - Hospitalization: {1.0: np.int64(85196), 0.0: np.int64(20155), 2.0: np.int64(626)}
  - Amputation: {0.0: np.int64(78028), 1.0: np.int64(27944), 2.0: np.int64(17)}
  - Loss of Eye: {0.0: np.int64(105956), 1.0: np.int64(35)}
- **Safety Relevance**: High relevance for occupational injury classification, worker involvement, severe trauma, body part impact, and incident narratives.
- **Recommended Usage**: NLP narrative feature extraction, body part mapping, injury consequence modeling, and energy-vector identification.
- **Limitations**:
  - Covers private/general industry across the United States; not specifically tailored to OIL operational environments.
  - OSHA severe injury reports document *observed outcomes* (severe injury resulted) rather than *near-miss precursor exposure* without injury.
  - **Do NOT automatically label every OSHA severe injury as SIF.** Observed severity $\\neq$ potential precursor exposure.

---

### 1.2 PHMSA Hazardous Liquid Pipeline Accident Dataset (2010–Present)
- **Filename**: ccident_hazardous_liquid_jan2010_present.csv
- **Source**: Pipeline and Hazardous Materials Safety Administration (PHMSA, US DOT)
- **File Type**: CSV (Comma-Separated Values)
- **Total Records**: 4,553 records
- **Total Columns**: 84 columns
- **Date Range**: 2010 to Present
- **Key Fields**:
  REPORT_NUMBER, IYEAR, LOCAL_DATETIME, NAME (Operator), PIPE_FAC_NAME, ON_OFF_SHORE, LOCATION_TYPE, INCIDENT_AREA_TYPE, SYSTEM_PART_INVOLVED, CAUSE, CAUSE_DETAILS, COMMODITY_RELEASED_TYPE, UNINTENTIONAL_RELEASE_BBLS, INTENTIONAL_RELEASE_BBLS, LIQUID_EXPLOSION_IND, LIQUID_IGNITE_IND, FATALITY_IND, INJURY_IND, NUM_WORKER_INJURIES, NUM_WORKER_FATALITIES
- **Safety Relevance**: High relevance for process safety, pressurized fluid containment loss, pipe corrosion, flange degradation, vapor cloud / fire explosion risks.
- **Recommended Usage**: Process safety barrier degradation modeling, release volume classification, pipeline mechanical integrity correlation.
- **Limitations**:
  - Specialized pipeline infrastructure; do NOT force pipeline-specific fields into generic worker-safety fields.
  - Lacks free-text personal near-miss descriptions (predominantly categorical and numeric engineering attributes).

---

### 1.3 IOGP Fatal Incident & High Potential Event Reports — Land Transportation (2025)
- **Filename**: 2025mfh.pdf
- **Source**: International Association of Oil & Gas Producers (IOGP)
- **File Type**: PDF Document
- **Total Pages**: 22 pages
- **Content Structure**: Incident narratives, causal factors, what went wrong, corrective actions, primary Life-Saving Rules (LSR), fatal injuries, high-potential events.
- **Safety Relevance**: Direct industry relevance to upstream oil & gas operations, land logistics, mobile plant, and Life-Saving Rules.
- **Recommended Usage**: Extraction of real-world oil & gas causal factors, barrier failures, corrective action templates, and IOGP Life-Saving Rules alignment.
- **Limitations**:
  - Focuses on land transportation and logistics within oil & gas operations.
  - Qualitative narratives requiring structured PDF parsing.

---

### 1.4 IOGP Aviation Safety Performance Indicators (2025)
- **Filename**: 2025ae.pdf
- **Source**: International Association of Oil & Gas Producers (IOGP)
- **File Type**: PDF Document
- **Total Pages**: 2 pages
- **Content Structure**: High-level statistical safety performance indicators for aviation in upstream/downstream oil & gas (2013–2025).
- **Safety Relevance**: Strategic reference benchmarks for aviation transport in energy operations.
- **Recommended Usage**: Treated as reference/context.
- **Limitations**:
  - Contains aggregated statistical metrics; do not force aggregate data into incident-level training records.

---

## 2. Common Training Schema & Cross-Dataset Field Mapping

| Common Training Schema Field | OSHA Dataset Source Field | PHMSA Dataset Source Field | IOGP 2025mfh Source Field | OIL Operational / Ingestion Field |
| :--- | :--- | :--- | :--- | :--- |
| 
ecord_id | Auto-generated (OSHA-<ID>) | Auto-generated (PHMSA-<REPORT_NUM>) | Auto-generated (IOGP-MFH-<NUM>) | Auto-generated (REP-<ORG>-<NUM>) |
| source | OSHA | PHMSA | IOGP_LAND_TRANSPORT | USER_SUBMITTED / USER_BULK_UPLOAD |
| source_record_id | ID | REPORT_NUMBER | Page / Case Reference | User Reference / Ingestion ID |
| event_date | EventDate | LOCAL_DATETIME | DATE | 
eport_date / Date |
| industry | Primary NAICS | Oil & Gas Pipeline | Upstream Oil & Gas Transport | Exploration, Drilling & Refining |
| 
eport_type | Severe Injury | Pipeline Accident | Fatal Incident / HiPo Event | Near Miss, Unsafe Act, Unsafe Condition |
| description | Final Narrative | CAUSE_DETAILS | NARRATIVE | description / Description |
| what_went_wrong | Extracted / NULL | Extracted / NULL | WHAT WENT WRONG | Extracted by AI / Ingestion notes |
| corrective_action | NULL | Extracted / NULL | CORRECTIVE ACTIONS | Preventive recommendations |
| cause | EventTitle | CAUSE | CAUSE | Identified root cause / hazard |
| causal_factors | SourceTitle, Secondary Source Title | CAUSE_DETAILS | Causal Analysis | Causal factors |
| hazard | NatureTitle | Commodity Released / Leak | Hazard Type | identified_hazard / Hazard |
| ctivity | NULL | Pipeline Operation | ACTIVITY | Operational task / activity |
| location | State, City | ONSHORE_CITY_NAME, PIPE_FAC_NAME | COUNTRY | location / Site |
| equipment | SourceTitle | SYSTEM_PART_INVOLVED | Vehicle / Mobile Plant | Industrial equipment / unit |
| worker_involvement | YES | Derived from Injuries/Fatalities | YES | Derived from text |
| worker_exposure | YES (Injured worker) | NUM_WORKER_INJURIES > 0 | YES (Fatality / HiPo) | Assessed proximity / line-of-fire |
| injury_type | NatureTitle | NULL | Nature of injury | Injury description / None |
| severity | Hospitalized / Amputation | FATALITY_IND, INJURY_IND | NUMBER OF DEATHS | Assessed severity / consequence |
| hospitalization | Hospitalized | Derived from injury records | Derived from incident text | Derived from text |
| mputation | Amputation | NULL | NULL | Derived from text |
| loss_of_eye | Loss of Eye | NULL | NULL | Derived from text |
| atality | 0 (Severe injury report) | NUM_WORKER_FATALITIES | NUMBER OF DEATHS | Derived from text |
| high_potential | Evaluated by energy/barrier | LIQUID_EXPLOSION_IND | Yes (High Potential Event) | AI SIF Assessment (YES/NO/INSUFFICIENT) |
| energy_vector | Extracted (Gravity, Kinetic, etc.) | High Pressure / Flammable Fluid | Kinetic / Driving / Crushing | Gravity, Electrical, Pressure, Chemical, Thermal |
| arrier_status | Extracted / NULL | Barrier / Containment failure | Barrier status | Barrier Adequate, Degraded, Failed, Missing |
| arrier_failure | Extracted / NULL | Equipment Failure / Corrosion | Extracted barrier failure | Specific failed defense |
| life_saving_rule | Matched IOGP LSR | Process Safety / Isolation | PRIMARY LIFE-SAVING RULE | IOGP 9 Life-Saving Rules |
| sif_label | Evidence-based (YES/NO/INSUFFICIENT) | Evidence-based (YES/NO/INSUFFICIENT) | YES (Fatal/HiPo) | Evidence-based (YES/NO/INSUFFICIENT) |
| sif_label_source | Expert Rule & Energy Calibration | Process Engineering Criteria | IOGP Verified Case | Safety Sentinel AI Pipeline |
| data_quality | HIGH | HIGH | HIGH | PRODUCTION |
| provenance | External Reference | External Reference | External Reference | Application Operational Database |

---

## 3. Data Governance Principles

1. **No Data Fabrication**: Where a field is absent in a dataset (such as equipment in an OSHA slip observation or worker_exposure in an unmanned pipeline leak), it is recorded as NULL. Never invent locations, activities, energies, or barriers.
2. **Decoupling Injury Severity from SIF Potential**: Severe injuries do not automatically constitute SIF precursors unless high hazardous energy vectors and critical barrier deficiencies were active.
3. **Tri-State SIF Precursor Assessment**:
   - YES: Objective evidence of hazardous energy release or critical barrier deficiency with potential for fatality or permanent disability.
   - NO: Low-energy routine observation with intact defenses and low consequence potential.
   - INSUFFICIENT_INFORMATION: Incomplete observation lacking sufficient detail to establish energy vector or barrier status. Missing information $\\neq$ Unrelated Input.
