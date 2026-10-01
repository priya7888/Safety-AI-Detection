import urllib.request
import json

def test_api():
    # 1. Authenticate
    login_data = json.dumps({'org_id': 'id001', 'email': 'admin1@gmail.com', 'password': 'Admin1@123'}).encode('utf-8')
    login_req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(login_req) as resp:
        auth_data = json.loads(resp.read().decode())
        token = auth_data['access_token']
        print(f"Logged in successfully as: {auth_data['user']['email']} | Role: {auth_data['user']['role_name']}")

    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}

    # 2. Test Real SIF Analysis
    sif_payload = json.dumps({
        'report_text': 'Under 10-ton load, crane wire rope snapped on rig floor without exclusion zone or barricade, line whipped near crew.',
        'report_type': 'NEAR_MISS',
        'location': 'Unit 2'
    }).encode('utf-8')
    sif_req = urllib.request.Request('http://localhost:8000/api/analysis/analyze', data=sif_payload, headers=headers)
    with urllib.request.urlopen(sif_req) as resp:
        sif_res = json.loads(resp.read().decode())
        print('\n' + '='*65)
        print('SIF PRECURSOR OBSERVATION (DYNAMIC API RESPONSE)')
        print('='*65)
        print('Report Reference:      ', sif_res.get('report_reference'))
        print('Determination Status:  ', sif_res.get('determination_status'))
        print('SIF Precursor:         ', sif_res.get('sif_precursor'))
        print('AI Classification:     ', sif_res.get('ai_classification'))
        print('Rule-Based Assessment: ', sif_res.get('rule_based_assessment'))
        print('ML SIF Probability:    ', sif_res.get('ml_probability'))
        print('Risk Score (MAUT):     ', sif_res.get('risk_score'))
        print('AI Model Confidence:   ', sif_res.get('confidence'))
        print('Energy Vector:         ', sif_res.get('energy_source'))
        print('Barrier Status:        ', sif_res.get('barrier_status'))
        print('IOGP Rule:             ', sif_res.get('iogp_rule'))
        print('Contributing Features: ')
        for f in (sif_res.get('contributing_features') or [])[:4]:
            print(f"   - {f.get('term')}: weight {f.get('weight')} (SIF indicator: {f.get('indicates_sif')})")

    # 3. Test Routine Non-SIF Analysis
    non_sif_payload = json.dumps({
        'report_text': 'Routine housekeeping sweep completed on office walkway entrance at Unit 1. Minor dry leaves swept into dustbin without hazard.',
        'report_type': 'UNSAFE_CONDITION',
        'location': 'Unit 1'
    }).encode('utf-8')
    non_sif_req = urllib.request.Request('http://localhost:8000/api/analysis/analyze', data=non_sif_payload, headers=headers)
    with urllib.request.urlopen(non_sif_req) as resp:
        non_sif_res = json.loads(resp.read().decode())
        print('\n' + '='*65)
        print('ROUTINE NON-SIF OBSERVATION (DYNAMIC API RESPONSE)')
        print('='*65)
        print('Report Reference:      ', non_sif_res.get('report_reference'))
        print('Determination Status:  ', non_sif_res.get('determination_status'))
        print('SIF Precursor:         ', non_sif_res.get('sif_precursor'))
        print('AI Classification:     ', non_sif_res.get('ai_classification'))
        print('Rule-Based Assessment: ', non_sif_res.get('rule_based_assessment'))
        print('ML SIF Probability:    ', non_sif_res.get('ml_probability'))
        print('Risk Score (MAUT):     ', non_sif_res.get('risk_score'))
        print('AI Model Confidence:   ', non_sif_res.get('confidence'))
        print('Barrier Status:        ', non_sif_res.get('barrier_status'))

if __name__ == "__main__":
    test_api()
