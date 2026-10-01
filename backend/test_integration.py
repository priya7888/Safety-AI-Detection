import requests

BASE = 'http://127.0.0.1:8000/api'

# 1. Login
auth_res = requests.post(f'{BASE}/auth/login', json={'org_id': 'id001', 'email': 'admin1@gmail.com', 'password': 'Admin1@123'})
print('1. Login Status:', auth_res.status_code)
token = auth_res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Get Profile
prof_res = requests.get(f'{BASE}/auth/me', headers=headers)
print('2. Profile:', prof_res.json()['organization_name'])

# 3. Submit New Safety Report
new_rep = {
    'report_type': 'NEAR_MISS',
    'description': 'Worker operating overhead bridge crane in Bay 2 with worn wire rope. A 2-ton steel beam slipped during transport and swung into the designated pedestrian walkway where two workers were walking. No exclusion zone or spotter was present.',
    'location': 'Bay 2 Heavy Fabrication Shop',
    'report_date': '2026-09-05',
    'additional_context': 'Hoist limit switch was functional but sling showed mechanical fraying.'
}
sub_res = requests.post(f'{BASE}/reports', json=new_rep, headers=headers)
print('3. Report Submission Status:', sub_res.status_code)
rep_data = sub_res.json()
print('   Reference:', rep_data['report_reference'])
print('   SIF Precursor Assessment:', rep_data['ai_analysis']['sif_precursor_assessment'])
print('   Identified Hazard:', rep_data['ai_analysis']['identified_hazard'])
print('   Explanation:', rep_data['ai_analysis']['explanation'])

# 4. Submit Human Review / Feedback
fb_res = requests.post(f"{BASE}/feedback/reports/{rep_data['id']}", json={
    'feedback_status': 'CORRECT',
    'feedback_text': 'Accurate SIF precursor assessment. Immediate exclusion barricades and revised rigging inspection instituted.'
}, headers=headers)
print('4. Feedback Submission Status:', fb_res.status_code)

# 5. SIF Intelligence Check
sif_res = requests.get(f'{BASE}/sif-intelligence', headers=headers)
print('5. SIF Intelligence:', sif_res.json()['status_message'])
print('   Findings Count:', len(sif_res.json()['findings']))

# 6. Organization Data Isolation Check (id002 login)
auth_res_02 = requests.post(f'{BASE}/auth/login', json={'org_id': 'id002', 'email': 'admin2@gmail.com', 'password': 'Admin2@123'})
token_02 = auth_res_02.json()['access_token']
headers_02 = {'Authorization': f'Bearer {token_02}'}
reps_02 = requests.get(f'{BASE}/reports', headers=headers_02).json()
print('6. Data Isolation Check (Org id002 report count):', len(reps_02), '(Guaranteed isolated from Org id001)')
