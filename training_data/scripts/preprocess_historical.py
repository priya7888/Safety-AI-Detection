import os, sys, csv
import pandas as pd
import pypdf

def normalize_historical_data():
    print("Extracting and normalizing historical records into Common Training Schema...")

    p_osha = r'C:\Users\Dell\Downloads\January2015toNovember2025\January2015toNovember2025.csv'
    p_phmsa = r'C:\Users\Dell\Downloads\archive\accident_hazardous_liquid_jan2010_present.csv'

    records = []

    # 1. OSHA sample
    df_osha = pd.read_csv(p_osha, encoding='utf-8', low_memory=False, nrows=500)
    for _, row in df_osha.iterrows():
        narrative = str(row.get('Final Narrative', '')).strip()
        if not narrative or narrative == 'nan':
            continue
        
        # Energy vector heuristic based purely on narrative facts without inventing
        energy = None
        lower_narr = narrative.lower()
        if any(w in lower_narr for w in ['fall', 'fell', 'scaffold', 'roof', 'ladder', 'height']):
            energy = 'Gravity'
        elif any(w in lower_narr for w in ['electric', 'shock', 'arc', 'voltage', 'wire']):
            energy = 'Electrical'
        elif any(w in lower_narr for w in ['pressure', 'hydraulic', 'pressurized', 'steam']):
            energy = 'High Pressure/Pneumatic'
        elif any(w in lower_narr for w in ['chemical', 'acid', 'solvent', 'toxic']):
            energy = 'Chemical'
        elif any(w in lower_narr for w in ['fire', 'burn', 'hot', 'thermal', 'flame']):
            energy = 'Thermal'
        elif any(w in lower_narr for w in ['struck', 'crush', 'caught', 'pinch', 'crane', 'machine']):
            energy = 'Kinetic'

        rec = {
            'record_id': f"OSHA-{row.get('ID', '')}",
            'source': 'OSHA',
            'source_record_id': str(row.get('ID', '')),
            'event_date': str(row.get('EventDate', '')),
            'industry': str(row.get('Primary NAICS', 'NULL')),
            'report_type': 'Severe Injury',
            'event_type': str(row.get('EventTitle', 'NULL')),
            'description': narrative,
            'what_went_wrong': None,
            'corrective_action': None,
            'cause': str(row.get('EventTitle', 'NULL')),
            'causal_factors': str(row.get('SourceTitle', 'NULL')),
            'hazard': str(row.get('NatureTitle', 'NULL')),
            'activity': None,
            'location': f"{row.get('City', '')}, {row.get('State', '')}".strip(', '),
            'equipment': str(row.get('SourceTitle', 'NULL')),
            'worker_involvement': 'YES',
            'worker_exposure': 'YES',
            'injury_type': str(row.get('NatureTitle', 'NULL')),
            'severity': 'Hospitalization' if row.get('Hospitalized') == 1.0 else ('Amputation' if row.get('Amputation') == 1.0 else 'Severe Injury'),
            'hospitalization': int(row.get('Hospitalized')) if pd.notna(row.get('Hospitalized')) else None,
            'amputation': int(row.get('Amputation')) if pd.notna(row.get('Amputation')) else None,
            'loss_of_eye': int(row.get('Loss of Eye')) if pd.notna(row.get('Loss of Eye')) else None,
            'fatality': 0,
            'high_potential': 'INSUFFICIENT_INFORMATION',
            'energy_vector': energy or 'Unknown',
            'barrier_status': None,
            'barrier_failure': None,
            'life_saving_rule': None,
            'sif_label': 'INSUFFICIENT_INFORMATION',
            'sif_label_source': 'Evidence Assessment (Observed Severity != SIF Precursor)',
            'data_quality': 'HIGH',
            'provenance': 'OSHA Severe Injury Reports'
        }
        records.append(rec)

    # 2. PHMSA sample
    df_phmsa = pd.read_csv(p_phmsa, encoding='utf-8', low_memory=False, nrows=200)
    for _, row in df_phmsa.iterrows():
        cause = str(row.get('CAUSE', 'NULL'))
        details = str(row.get('CAUSE_DETAILS', 'NULL'))
        fatal = int(row.get('FATAL', 0)) if pd.notna(row.get('FATAL')) else 0
        injur = int(row.get('INJURE', 0)) if pd.notna(row.get('INJURE')) else 0
        
        desc = f"Pipeline incident on {row.get('PIPE_FAC_NAME', 'facility')} ({row.get('SYSTEM_PART_INVOLVED', 'pipeline system')}). Primary cause: {cause} - {details}."
        
        is_explosion = str(row.get('EXPLODE_IND', '')).upper() == 'YES' or str(row.get('LIQUID_EXPLOSION_IND', '')).upper() == 'YES'
        is_ignite = str(row.get('IGNITE_IND', '')).upper() == 'YES' or str(row.get('LIQUID_IGNITE_IND', '')).upper() == 'YES'

        rec = {
            'record_id': f"PHMSA-{row.get('REPORT_NUMBER', '')}",
            'source': 'PHMSA',
            'source_record_id': str(row.get('REPORT_NUMBER', '')),
            'event_date': str(row.get('LOCAL_DATETIME', '')),
            'industry': 'Hazardous Liquid Pipeline',
            'report_type': 'Pipeline Accident',
            'event_type': 'Containment Failure / Release',
            'description': desc,
            'what_went_wrong': details if details != 'NULL' else None,
            'corrective_action': None,
            'cause': cause,
            'causal_factors': details,
            'hazard': 'Pressurized Flammable/Toxic Fluid Release',
            'activity': 'Pipeline Transmission & Storage',
            'location': str(row.get('ONSHORE_CITY_NAME', row.get('PIPE_FAC_NAME', 'NULL'))),
            'equipment': str(row.get('SYSTEM_PART_INVOLVED', 'Pipeline Facility')),
            'worker_involvement': 'YES' if (fatal > 0 or injur > 0) else 'NO',
            'worker_exposure': 'YES' if (fatal > 0 or injur > 0) else 'NO',
            'injury_type': 'Workforce Injury' if injur > 0 else None,
            'severity': 'Fatality' if fatal > 0 else ('Injury' if injur > 0 else 'Property/Containment Damage'),
            'hospitalization': None,
            'amputation': None,
            'loss_of_eye': None,
            'fatality': fatal,
            'high_potential': 'YES' if (is_explosion or is_ignite or fatal > 0) else 'NO',
            'energy_vector': 'High Pressure/Pneumatic' if not (is_explosion or is_ignite) else 'Multiple',
            'barrier_status': 'BARRIER_FAILED',
            'barrier_failure': cause,
            'life_saving_rule': 'Energy Isolation',
            'sif_label': 'YES' if (fatal > 0 or is_explosion) else ('NO' if (fatal == 0 and injur == 0 and not is_explosion) else 'INSUFFICIENT_INFORMATION'),
            'sif_label_source': 'PHMSA Process Safety & Explosion Metrics',
            'data_quality': 'HIGH',
            'provenance': 'PHMSA Hazardous Liquid Pipeline Accident Database'
        }
        records.append(rec)

    # Convert to DataFrame and write to processed
    df_out = pd.DataFrame(records)
    out_path = 'training_data/processed/common_training_sample.csv'
    df_out.to_csv(out_path, index=False, encoding='utf-8')
    print(f"Successfully processed and normalized {len(df_out)} records to {out_path}!")

if __name__ == '__main__':
    normalize_historical_data()
