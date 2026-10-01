import re
from typing import Dict, Optional

def analyze_energy_and_exposure(text: str) -> Dict[str, Optional[str]]:
    """
    Identifies specific energy sources and worker exposure contexts when supported.
    Returns None when the information is not supported by the report.
    """
    lower_text = text.lower()
    energy_source = None
    exposure = None

    # 1. Energy Source Detection
    if re.search(r'\b(overhead|suspended|crane|hoist|dropped|fell from|height|scaffold|ladder|roof|edge)\b', lower_text):
        energy_source = "Gravity (High elevation potential energy / falling mass)"
    elif re.search(r'\b(electrical|voltage|440v|11kv|live cable|spark|arc flash|switchgear|breaker)\b', lower_text):
        energy_source = "Electrical Energy (Live high-voltage circuit / arc flash potential)"
    elif re.search(r'\b(pressurized|pressure|hydraulic|steam|gas line|pipeline|hydrotest|blowout|manifold)\b', lower_text):
        energy_source = "Stored Pressure / Pneumatic & Hydraulic Energy"
    elif re.search(r'\b(rotating|shaft|gear|conveyor|pinch|roller|impeller|grinder)\b', lower_text):
        energy_source = "Mechanical Energy (High-speed rotating equipment / kinetic nip points)"
    elif re.search(r'\b(forklift|truck|vehicle|dumper|loader|trailer|moving crane)\b', lower_text):
        energy_source = "Kinetic Energy (Mobile industrial vehicle / heavy moving mass)"
    elif re.search(r'\b(fire|hot work|welding flame|flash fire|hot steam|molten)\b', lower_text):
        energy_source = "Thermal Energy (High temperature / open flame / flammable vapor)"
    elif re.search(r'\b(acid|toxic gas|h2s|chemical|corrosive|hazardous fluid)\b', lower_text):
        energy_source = "Chemical / Toxic Energy (Acute toxicity / corrosive contact)"

    # 2. Exposure Context Detection
    if re.search(r'\b(standing under|beneath|in drop zone|near crane|under load)\b', lower_text):
        exposure = "Worker directly exposed in line-of-fire beneath suspended load"
    elif re.search(r'\b(at height|on scaffold|on roof|on ladder|near open edge|at elevation)\b', lower_text):
        exposure = "Worker exposed to unprotected fall edge at elevation"
    elif re.search(r'\b(live panel|touching|bare hands|no gloves|near energized|contact with live)\b', lower_text):
        exposure = "Worker in direct physical proximity to live electrical conductors"
    elif re.search(r'\b(near forklift|walking path|blind turn|reversing|crossing vehicle path)\b', lower_text):
        exposure = "Pedestrian worker situated in immediate trajectory of mobile equipment"
    elif re.search(r'\b(inside tank|in vessel|inside manhole|enclosed chamber)\b', lower_text):
        exposure = "Worker occupied within enclosed/confined space environment"
    elif re.search(r'\b(near rotating|reaching into|near belt|unprotected nip)\b', lower_text):
        exposure = "Worker limbs in proximity to unguarded mechanical movement"
    elif re.search(r'\b(bypassed|no ppe|without protection|unprotected)\b', lower_text):
        exposure = "Worker performing high-risk task without primary protection barrier"

    return {
        "energy_source": energy_source,
        "exposure": exposure
    }
