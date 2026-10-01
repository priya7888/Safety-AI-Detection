// Mock HSE Safety Data for Oil India Limited (OIL-INDIA-HSSE)
// Calibrated for Core UX: Summary -> Pattern -> Detail

export const MOCK_KPIS = {
  totalReports: 1248,
  totalReportsTrend: '+12%',
  sifPotential: 87,
  sifPotentialTrend: '+3%',
  precursors: 143,
  precursorsTrend: '+5%',
  controlFailures: 31,
  controlFailuresTrend: '+3%'
};

export const MOCK_REPORTS = [
  {
    id: '#1042',
    rawId: 1042,
    title: 'Unusual vibration in compressor',
    activity: 'Maintenance',
    location: 'Duliajan CPF – Compressor Unit 3',
    date: '06 Sep 2025',
    timestamp: '2025-09-06T09:15:00',
    sifPotential: 'YES',
    confidence: 94,
    status: 'Investigate',
    statusColor: 'red',
    hazard: 'Mechanical Kinetic Energy / Rotating Equipment Catastrophic Failure',
    energySource: 'Kinetic & Mechanical (High Speed Compressor Shaft)',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Vibration Monitoring Interlock Sensor',
    description: 'During scheduled PM shift, acoustic sensor detected harmonic vibration amplitude spike (>8.2 mm/s RMS) on Booster Compressor Stage 2. Bearing casing temperature reached 92°C before automated trip triggered. Inspection showed severe radial shaft misalignment.',
    remediationAction: 'Lock out compressor skid, replace dual ceramic roller bearings, recalibrate acoustic trip switch before re-energizing.',
    reporter: 'R. Davis (Lead Reliability Engineer)',
    humanValidation: 'Pending HSSE Review',
    // Detailed AI assessment breakdown for drawer/modal
    whyAiFlagged: {
      highEnergy: 'High-speed rotating shaft with kinetic energy exceeding mechanical tolerance thresholds.',
      barrierConcern: 'Vibration monitoring trip switch was running on degraded calibration setting.',
      consequence: 'Catastrophic bearing seizure and casing rupture with metal fragmentation risk.'
    },
    safetyIntelligence: {
      hazard: 'Rotating Equipment Over-vibration',
      exposure: '2 technicians performing on-skid diagnostic logging',
      precursor: 'Uncalibrated sensor thresholds with harmonic resonance',
      criticalControl: 'Automated Vibration Shutdown Interlock',
      controlFailure: 'Sensor signal damped by loose wiring bracket'
    }
  },
  {
    id: '#1041',
    rawId: 1041,
    title: 'Hydrocarbon leak near flange',
    activity: 'Drilling',
    location: 'Assam Asset – Drilling Rig 04 Derrick Floor',
    date: '05 Sep 2025',
    timestamp: '2025-09-05T14:40:00',
    sifPotential: 'YES',
    confidence: 87,
    status: 'Reviewed',
    statusColor: 'blue',
    hazard: 'High Pressure Hydrocarbon Release / Fire & Explosion Potential',
    energySource: 'Pressure & Chemical (1500 PSI Sour Gas Line)',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Spiral Wound Flange Gasket Seal',
    description: 'Mud logging sensor detected localized combustible hydrocarbon mist (45% LEL) escaping from a 6-inch bolted flange assembly during high-pressure mud circulation. Immediate emergency shut-off activated.',
    remediationAction: 'Depressurize manifold, replace degraded spiral-wound graphite gasket with certified Inconel ring, perform helium leak test.',
    reporter: 'P. Barua (Drilling Superintendent)',
    humanValidation: 'Validated as SIF Precursor by HSE Lead',
    whyAiFlagged: {
      highEnergy: '1500 PSI Sour Gas line operating well above threshold for toxic gas cloud formation.',
      barrierConcern: 'Primary spiral-wound metallic flange seal failed under cyclic mud pressure.',
      consequence: 'Flash fire or toxic H2S exposure in confined derrick substructure.'
    },
    safetyIntelligence: {
      hazard: 'Pressurized Flammable Hydrocarbon Release',
      exposure: 'Derrick roughneck crew working 3 meters downwind',
      precursor: 'Bolt torque relaxation following thermal expansion',
      criticalControl: 'Spiral-Wound Certified Flange Gasket',
      controlFailure: 'Gasket erosion along inner sealing ring'
    }
  },
  {
    id: '#1038',
    rawId: 1038,
    title: 'Bypass of safety interlock',
    activity: 'Operations',
    location: 'Naharkatiya Station – Gas Processing Skid',
    date: '04 Sep 2025',
    timestamp: '2025-09-04T11:20:00',
    sifPotential: 'YES',
    confidence: 91,
    status: 'In Progress',
    statusColor: 'green',
    hazard: 'Uncontrolled Flammable Overpressure in High-Volume Vessel',
    energySource: 'Thermal & Chemical Overpressure',
    barrierStatus: 'BARRIER_DEGRADED',
    failedBarrier: 'Automated Emergency Depressurization (EDP) Interlock',
    description: 'Field operator found software bypass jumper active on high-high pressure trip transmitter PT-402 during batch condensate separation. Jumper was left in place after instrument calibrator shift change without authorized override permit.',
    remediationAction: 'Physically remove bypass jumper, test hardwired trip logic, audit all override logbooks across plant shifts.',
    reporter: 'M. Gogoi (Senior Process Specialist)',
    humanValidation: 'Confirmed Critical Control Violation',
    whyAiFlagged: {
      highEnergy: 'Processing vessel capacity >20,000 liters under continuous 600 PSI separator pressure.',
      barrierConcern: 'Software trip override removed the automated automated depressurization safeguard.',
      consequence: 'BLEVE / vessel rupture in event of sudden feed slug.'
    },
    safetyIntelligence: {
      hazard: 'Vessel Catastrophic Overpressurization',
      exposure: 'Separation unit field operators on active patrol',
      precursor: 'Unauthorized bypass jumper left across terminal blocks',
      criticalControl: 'Emergency Depressurization (EDP) Interlock',
      controlFailure: 'Override management protocol not adhered to during shift handover'
    }
  },
  {
    id: '#1036',
    rawId: 1036,
    title: 'Pressure relief valve issue',
    activity: 'Inspection',
    location: 'Digboi Facility – Crude Storage Tank 12',
    date: '03 Sep 2025',
    timestamp: '2025-09-03T16:05:00',
    sifPotential: 'NO',
    confidence: 12,
    status: 'Closed',
    statusColor: 'slate',
    hazard: 'Minor Valve Seal Corrosion (Low Atmospheric Energy)',
    energySource: 'Atmospheric Storage Vapors (<0.5 PSI)',
    barrierStatus: 'BARRIER_EFFECTIVE',
    failedBarrier: 'None (Preventive Observation)',
    description: 'Routine quarterly thermal imaging audit identified slight surface salt buildup and weep trace on external casing of conservation vent breather valve. No pressure buildup or VOC emissions detected above baseline.',
    remediationAction: 'Clean valve seating face, grease pivot pin assembly, logged into preventative maintenance register.',
    reporter: 'S. Neog (Asset Integrity Inspector)',
    humanValidation: 'Non-SIF Routine Observation',
    whyAiFlagged: {
      highEnergy: 'Low-energy atmospheric storage tank (<0.5 PSI pressure).',
      barrierConcern: 'Breather valve remained 100% mechanically functional.',
      consequence: 'Negligible consequence — surface salt weep only.'
    },
    safetyIntelligence: {
      hazard: 'Surface Atmospheric Corrosion',
      exposure: 'None (Contained tank vent)',
      precursor: 'Atmospheric humid sea salt accumulation',
      criticalControl: 'Conservation Breather Vent',
      controlFailure: 'None — routine preventative observation'
    }
  },
  {
    id: '#1032',
    rawId: 1032,
    title: 'Chemical spill during transfer',
    activity: 'Operations',
    location: 'Moran Field – Chemical Injection Skid B',
    date: '02 Sep 2025',
    timestamp: '2025-09-02T10:15:00',
    sifPotential: 'YES',
    confidence: 83,
    status: 'Investigate',
    statusColor: 'red',
    hazard: 'Toxic Demulsifier Chemical Exposure / Skin & Respiratory Hazard',
    energySource: 'Chemical Toxicity & Corrosive Fluid',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Quick-Disconnect Camlock Transfer Hose Coupler',
    description: 'Transfer hose decoupled under 40 PSI pressure during batch charging of emulsion breaker chemical into injection tank. Approx 65 liters released into concrete secondary retention bund. Worker PPE prevented direct dermal contact.',
    remediationAction: 'Neutralize bund with soda ash, scrap worn camlock arms, mandate dual-locking whip checks on all chemical lines.',
    reporter: 'K. Sarma (Chemical Handling Officer)',
    humanValidation: 'Under Active Investigation',
    whyAiFlagged: {
      highEnergy: 'Corrosive chemical pumped under continuous hydraulic pressure.',
      barrierConcern: 'Camlock mechanical coupling failed under dynamic transfer vibration.',
      consequence: 'Severe dermal burns or respiratory toxic inhalation.'
    },
    safetyIntelligence: {
      hazard: 'Pressurized Corrosive Chemical Release',
      exposure: 'Pump operator standing at hose transfer manifold',
      precursor: 'Worn camlock locking arm retaining pins',
      criticalControl: 'Secondary Retention Bund & Whip-Check Cable',
      controlFailure: 'Whip-check cable was disconnected during hookup'
    }
  },
  {
    id: '#1029',
    rawId: 1029,
    title: 'Fall arrest lanyard frayed on derrick monkey board',
    activity: 'Drilling',
    location: 'Assam Asset – Rig 04 Mast (28m Elevation)',
    date: '01 Sep 2025',
    timestamp: '2025-09-01T08:30:00',
    sifPotential: 'YES',
    confidence: 96,
    status: 'Reviewed',
    statusColor: 'blue',
    hazard: 'Working at Heights / Gravity Fall from 28 Meters',
    energySource: 'Gravity (Potential Energy > 20kJ)',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Personal Fall Arrest System (PFAS)',
    description: 'Derrickman safety harness shock-absorbing lanyard showed 35% cross-section fiber cutting caused by rubbing against sharp structural angle iron during tripping pipe operations. Immediate stop-work called.',
    remediationAction: 'Destructively decommission lanyard, replace with Kevlar-sheathed heavy duty lanyard, install polyurethane edge guards on all mast beams.',
    reporter: 'T. Borah (HSE Field Supervisor)',
    humanValidation: 'High Potential Near-Miss Confirmed',
    whyAiFlagged: {
      highEnergy: 'Working at 28 meters elevation (>1.8m IOGP threshold).',
      barrierConcern: 'Single lifeline fall arrest lanyard was severely compromised.',
      consequence: 'Fatal fall in the event of derrickman slip or rig jerk.'
    },
    safetyIntelligence: {
      hazard: 'Fall from Extreme Elevation',
      exposure: '1 derrickman on monkey board platform',
      precursor: 'Repetitive chafing across unshielded structural steel angle',
      criticalControl: 'Certified Dual Shock-Absorbing Lanyard',
      controlFailure: 'Chafing protective sleeve omitted'
    }
  },
  {
    id: '#1025',
    rawId: 1025,
    title: 'Unauthorized entry to 11kV electrical substation',
    activity: 'Maintenance',
    location: 'Duliajan CPF – Main Substation A',
    date: '31 Aug 2025',
    timestamp: '2025-08-31T17:10:00',
    sifPotential: 'YES',
    confidence: 93,
    status: 'Investigate',
    statusColor: 'red',
    hazard: 'High Voltage Arc Flash & Electrocution',
    energySource: 'Electrical Energy (11kV Live Busbar)',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Substation Physical Access Control & Interlock Door',
    description: 'Contractor electrician entered live switchgear room without approved PTW (Permit to Work) or presence of authorized electrical engineer to retrieve multimeter left on transformer ledge.',
    remediationAction: 'Revoke gate pass, install biometric card lock on substation entrance, reinforce LOTO electrical authorization rules.',
    reporter: 'R. Davis (HSSE Lead Auditor)',
    humanValidation: 'SIF Precursor Flagged',
    whyAiFlagged: {
      highEnergy: '11,000 Volts with arc flash blast boundary exceeding 4 meters.',
      barrierConcern: 'Physical door lock was propped open by wooden wedge.',
      consequence: 'Fatal electrocution or third-degree arc flash burns.'
    },
    safetyIntelligence: {
      hazard: 'High Voltage Arc Flash & Live Conductor Contact',
      exposure: 'Contractor electrician inside live switchgear cubicle',
      precursor: 'Substation door propped open for ventilation',
      criticalControl: 'Interlocked Substation Access Control & PTW',
      controlFailure: 'Door latch failed to trigger automated security trip'
    }
  },
  {
    id: '#1021',
    rawId: 1021,
    title: 'Missing grating section on high elevation walkway',
    activity: 'Inspection',
    location: 'Naharkatiya Station – Distillation Tower Platform Level 4',
    date: '30 Aug 2025',
    timestamp: '2025-08-30T13:45:00',
    sifPotential: 'YES',
    confidence: 89,
    status: 'In Progress',
    statusColor: 'green',
    hazard: 'Unguarded Void / Gravity Fall > 14 Meters',
    energySource: 'Gravity Energy',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Rigid Perimeter Walkway Barricading & Toe Boards',
    description: '1.2m x 0.9m steel grating segment was lifted for piping insulation inspection and left unsecured overnight with only yellow caution tape stretched across opening without rigid guardrails.',
    remediationAction: 'Secure high-visibility steel scaffolding plank covers, clamp with J-bolts, install rigid scaffolding handrails.',
    reporter: 'S. Neog (Structural Integrity Inspector)',
    humanValidation: 'Validated SIF Hazard',
    whyAiFlagged: {
      highEnergy: 'Elevated open platform 14 meters above ground.',
      barrierConcern: 'Rigid perimeter barricade replaced with fragile tape.',
      consequence: 'Fatal fall through open platform void.'
    },
    safetyIntelligence: {
      hazard: 'Fall Through Unguarded Floor Opening',
      exposure: 'Night shift process operators conducting gauge rounds',
      precursor: 'Temporary grating removal without certified solid cover',
      criticalControl: 'Bolted Steel Grating & Rigid Scaffolding Handrails',
      controlFailure: 'J-bolt clamps omitted following inspection'
    }
  },
  {
    id: '#1017',
    rawId: 1017,
    title: 'Heavy crane rigging swing near crew muster point',
    activity: 'Construction',
    location: 'Assam Asset – New Tank Farm Expansion',
    date: '28 Aug 2025',
    timestamp: '2025-08-28T11:00:00',
    sifPotential: 'YES',
    confidence: 88,
    status: 'Reviewed',
    statusColor: 'blue',
    hazard: 'Suspended Load Kinetic Impact & Crushing',
    energySource: 'Suspended Gravity / Kinetic Energy (8 Ton Pre-cast Slab)',
    barrierStatus: 'BARRIER_DEGRADED',
    failedBarrier: 'Drop-Zone Exclusion Perimeter & Tag-Line Control',
    description: 'Mobile crane boom swung an 8-ton precast concrete foundation block directly over an active pedestrian walkway during wind gust exceeding 32 knots. Tag lines were manned by only one rigger instead of two.',
    remediationAction: 'Halt lifting operations whenever wind exceeds 25 knots; enforce secondary rigger tag-line mandate and hard exclusion stanchions.',
    reporter: 'A. Chaliha (Civil Construction Lead)',
    humanValidation: 'Precursor Event Confirmed',
    whyAiFlagged: {
      highEnergy: '8-ton suspended precast slab acting as dynamic pendulum.',
      barrierConcern: 'Drop-zone exclusion barrier was not manned.',
      consequence: 'Crush impact fatality under load swing path.'
    },
    safetyIntelligence: {
      hazard: 'Suspended Load Impact & Line-of-Fire',
      exposure: '4 construction workers crossing muster path',
      precursor: 'Lifting operation continued during wind gusts >30 knots',
      criticalControl: 'Physical Drop-Zone Exclusion Stanchions',
      controlFailure: 'Exclusion tape boundary too close to load radius'
    }
  },
  {
    id: '#1014',
    rawId: 1014,
    title: 'Hot work torch ignited vapor trace in drain trench',
    activity: 'Maintenance',
    location: 'Digboi Facility – Effluent Treatment Plant',
    date: '26 Aug 2025',
    timestamp: '2025-08-26T15:20:00',
    sifPotential: 'YES',
    confidence: 95,
    status: 'Closed',
    statusColor: 'slate',
    hazard: 'Confined Flash Fire / Flammable Gas Atmosphere',
    energySource: 'Thermal & Hydrocarbon Vapor Flash',
    barrierStatus: 'BARRIER_FAILED',
    failedBarrier: 'Combustible Gas Testing Protocol & Drain Water Seal',
    description: 'Oxy-acetylene cutting sparks dropped into open wastewater channel containing trapped residual condensate, causing brief 3-second flash fire. Extinguished immediately with dry powder. Gas test was conducted 50m away instead of at trench edge.',
    remediationAction: 'Mandate four-gas continuous sniffer testing directly inside open drains prior to any hot work; flood trenches with firefighting foam blanket.',
    reporter: 'M. Gogoi (Senior Safety Engineer)',
    humanValidation: 'SIF Precursor Lesson Learned',
    whyAiFlagged: {
      highEnergy: 'Cutting torch thermal flame + trapped hydrocarbon vapors.',
      barrierConcern: 'Gas testing protocol was executed away from hot work zone.',
      consequence: 'Flash fire and potential trench vapor cloud explosion.'
    },
    safetyIntelligence: {
      hazard: 'Flammable Atmosphere Ignition',
      exposure: 'Welder and fire watcher standing over trench rim',
      precursor: 'Hot work conducted without sniffing open drainage trenches',
      criticalControl: 'Point-of-Work Continuous Combustible Gas Testing',
      controlFailure: 'Gas tester sensor placed outside 5-meter work radius'
    }
  }
];

export const MOCK_TREND_DATA = [
  { month: 'Mar', value: 32 },
  { month: 'Apr', value: 45 },
  { month: 'May', value: 58 },
  { month: 'Jun', value: 52 },
  { month: 'Jul', value: 71 },
  { month: 'Aug', value: 87 }
];

export const MOCK_ACTIVITY_DATA = [
  { label: 'Maintenance', percentage: 28, count: 349, color: '#f59e0b' },
  { label: 'Operations', percentage: 22, count: 275, color: '#d97706' },
  { label: 'Drilling', percentage: 18, count: 225, color: '#b45309' },
  { label: 'Inspection', percentage: 15, count: 187, color: '#fbbf24' },
  { label: 'Construction', percentage: 10, count: 125, color: '#78350f' },
  { label: 'Other', percentage: 7, count: 87, color: '#94a3b8' }
];

// Refined Highest-Risk Locations Table for Overview
export const MOCK_HIGHEST_RISK_LOCATIONS = [
  { location: 'Duliajan CPF', sifPotential: 18, trend: 'up', riskLevel: 'High' },
  { location: 'Assam Asset (Rig 04)', sifPotential: 14, trend: 'up', riskLevel: 'High' },
  { location: 'Moran Field', sifPotential: 11, trend: 'stable', riskLevel: 'Medium' },
  { location: 'Naharkatiya Station', sifPotential: 8, trend: 'down', riskLevel: 'Medium' },
  { location: 'Digboi Facility', sifPotential: 5, trend: 'down', riskLevel: 'Low' }
];

// Refined Requires Attention Section for Overview
export const MOCK_REQUIRES_ATTENTION = [
  {
    id: 'ATT-01',
    title: 'Isolation verification failures',
    detail: '14 reports · 3 assets · +22%',
    consequence: 'Unexpected electrical or pressure energy release',
    criticalControl: 'Energy Isolation / LOTO',
    priority: 'HIGH'
  },
  {
    id: 'ATT-02',
    title: 'Maintenance-related precursor increase',
    detail: '+22% in last 30 days',
    consequence: 'Elevated bearing failure and line-breaking risk',
    criticalControl: 'Mechanical Interlocks & Vibration Monitoring',
    priority: 'HIGH'
  },
  {
    id: 'ATT-03',
    title: 'Electrical access-control failures',
    detail: 'Repeated at Duliajan CPF',
    consequence: '11kV live switchgear exposure without zero-energy check',
    criticalControl: 'Substation Interlock & PTW Verification',
    priority: 'MEDIUM'
  }
];

// Primary Content for SIF Intelligence Page
export const MOCK_RECURRING_SIF_PATTERNS = [
  {
    id: 'PAT-01',
    title: 'Isolation verification failures',
    reportsCount: 14,
    affectedAssets: '3 assets (Duliajan, Rig 04, Moran)',
    trend: '+22%',
    trendDirection: 'up',
    potentialConsequence: 'Unexpected energy release / high-voltage electrocution',
    criticalControl: 'Energy Isolation / LOTO',
    priority: 'HIGH',
    evidenceSummary: '14 safety reports over 60 days mention mechanical servicing commencing while secondary zero-energy state verification was missing.',
    aiReasoning: {
      energyMagnitude: 'High (11kV & 1500 PSI Sour Gas)',
      barrierDegradation: 'Detected (LOTO bypasses & missing sign-offs)',
      workerExposure: 'Active (Within direct blast / line-of-fire)',
      sifPotential: 'HIGH'
    }
  },
  {
    id: 'PAT-02',
    title: 'Hydrocarbon release during maintenance',
    reportsCount: 9,
    affectedAssets: '2 assets (Assam Rig 04, Naharkatiya)',
    trend: '+16%',
    trendDirection: 'up',
    potentialConsequence: 'Pressurized mist ignition / catastrophic vapor cloud flash',
    criticalControl: 'Flange Integrity & Gasket Verification',
    priority: 'HIGH',
    evidenceSummary: 'Bolted flange clamp looseness and degraded spiral-wound graphite seals identified under dynamic cyclic pressure above 1200 PSI.',
    aiReasoning: {
      energyMagnitude: 'High (Flammable Hydrocarbon Mist >40% LEL)',
      barrierDegradation: 'Detected (Degraded flange seal gasket)',
      workerExposure: 'Active (Maintenance crew within 2 meters)',
      sifPotential: 'HIGH'
    }
  },
  {
    id: 'PAT-03',
    title: 'Working-at-height protection gaps',
    reportsCount: 7,
    affectedAssets: '3 assets (Level 3 Platform, Rig 04 Mast, Digboi)',
    trend: '+8%',
    trendDirection: 'up',
    potentialConsequence: 'Fatal fall from elevation >6 meters',
    criticalControl: 'Fall Arrest & Rigid Barricading',
    priority: 'MEDIUM',
    evidenceSummary: 'Unbolted walkway grating sections and frayed fall-arrest lanyards recorded on derrick monkey boards during tripping operations.',
    aiReasoning: {
      energyMagnitude: 'High (Gravity Potential Energy >20 kJ)',
      barrierDegradation: 'Detected (Temporary scaffold tape without rigid handrails)',
      workerExposure: 'Active (Derrick roughneck on monkey board)',
      sifPotential: 'MEDIUM'
    }
  },
  {
    id: 'PAT-04',
    title: 'Suspended load drop-zone intrusions',
    reportsCount: 6,
    affectedAssets: '2 assets (Rig 04 Derrick Floor, Laydown Yard)',
    trend: '-4%',
    trendDirection: 'down',
    potentialConsequence: 'Crush injury / kinetic impact from falling heavy steel flange',
    criticalControl: 'Drop-Zone Exclusion Perimeter',
    priority: 'MEDIUM',
    evidenceSummary: 'Crane hoisting operations without physical red exclusion stanchions; single-rigger tag-line control during gusty winds.',
    aiReasoning: {
      energyMagnitude: 'High (8 Ton Pre-cast Slab & 4-inch Flange)',
      barrierDegradation: 'Detected (Exclusion tape breached)',
      workerExposure: 'Active (Pedestrian walkway below swing path)',
      sifPotential: 'MEDIUM'
    }
  }
];

// Primary Content for Critical Controls Page
export const MOCK_CRITICAL_CONTROLS = [
  {
    id: 'CC-01',
    name: 'Energy Isolation & Lock-Out / Tag-Out (LOTO)',
    status: 'Attention Required',
    statusColor: 'amber',
    effectiveness: 68,
    relatedReportsCount: 7,
    lastReview: '02 Sep 2026',
    hazard: 'High Voltage & Pressurized Hydrocarbons',
    affectedLocations: 'Duliajan CPF, Moran Field',
    relatedSifPattern: 'Isolation verification failures',
    recentEvidence: '7 field audit reports in August recorded work starting before second-person zero-energy test was verified.',
    recommendedAction: 'Mandate independent verifier sign-off on all isolation permits before physical line break.'
  },
  {
    id: 'CC-02',
    name: 'Pressure Safety Valves & Bursting Discs',
    status: 'Healthy',
    statusColor: 'green',
    effectiveness: 94,
    relatedReportsCount: 2,
    lastReview: 'Yesterday',
    hazard: 'Vessel Catastrophic Overpressurization',
    affectedLocations: 'Digboi Facility, Duliajan CPF',
    relatedSifPattern: 'None (Operating within safe envelope)',
    recentEvidence: 'Automated relief pop tests certified within 110% MAWP design tolerances.',
    recommendedAction: 'Maintain current quarterly ultrasonic thickness and seat weep inspection.'
  },
  {
    id: 'CC-03',
    name: 'Drop-Zone Exclusion Perimeter & Rigging',
    status: 'Failed',
    statusColor: 'red',
    effectiveness: 42,
    relatedReportsCount: 6,
    lastReview: 'Immediate review',
    hazard: 'Suspended Load Fall & Heavy Impact',
    affectedLocations: 'Assam Rig 04 Derrick Floor',
    relatedSifPattern: 'Suspended load drop-zone intrusions',
    recentEvidence: 'Rigging sling certification lapsed; exclusion zone marked only with loose yellow tape rather than rigid barriers.',
    recommendedAction: 'Immediate stop-work on heavy lifts; replace tape with locked mechanical stanchions.'
  },
  {
    id: 'CC-04',
    name: 'Combustible & Toxic Gas Detection Grid',
    status: 'Healthy',
    statusColor: 'green',
    effectiveness: 91,
    relatedReportsCount: 3,
    lastReview: 'Today, 06:00 AM',
    hazard: 'H2S & Hydrocarbon Vapor Cloud Ignition',
    affectedLocations: 'Crude Storage Tanks, Wellheads',
    relatedSifPattern: 'Hydrocarbon release during maintenance',
    recentEvidence: 'Optical flame and catalytic bead sensors responded within 2.8s during bump test.',
    recommendedAction: 'Continue weekly calibration schedule on perimeter fence sensors.'
  },
  {
    id: 'CC-05',
    name: 'Permitted Hot Work Atmosphere Testing',
    status: 'Healthy',
    statusColor: 'green',
    effectiveness: 89,
    relatedReportsCount: 3,
    lastReview: '04 Sep 2026',
    hazard: 'Explosive Atmosphere Flash Ignition',
    affectedLocations: 'Effluent Treatment, Process Piping',
    relatedSifPattern: 'Drain vapor trace flash',
    recentEvidence: 'Continuous sniffer monitors active on 100% of hot work permits issued this week.',
    recommendedAction: 'Audit fire watcher logbooks at end of each shift.'
  },
  {
    id: 'CC-06',
    name: 'Fall Protection Systems & Elevated Walkways',
    status: 'Attention Required',
    statusColor: 'amber',
    effectiveness: 73,
    relatedReportsCount: 5,
    lastReview: '01 Sep 2026',
    hazard: 'High Elevation Fall (>1.8 Meters)',
    affectedLocations: 'Derrick Monkeys, Level 3 Platforms',
    relatedSifPattern: 'Working-at-height protection gaps',
    recentEvidence: '2 harness lanyards decommissioned due to edge friction wear; 1 temporary grating hatch left unsecured.',
    recommendedAction: 'Deploy edge-protection sleeves on all mast beams and inspect 100% of grating J-clamps.'
  }
];

export const MOCK_ORGANIZATION_PROFILE = {
  name: 'OIL-INDIA-HSSE',
  legalName: 'Oil India Limited – Health, Safety, Security & Environment Directorate',
  division: 'Upstream Exploration, Drilling & Refining Operational Safety Command',
  orgId: 'id001',
  headquarters: 'Duliajan, Dibrugarh District, Assam 786602, India',
  regNumber: 'OIL-HSSE-IND-001',
  auditStatus: 'HSE Tier 1 Certified',
  directors: [
    { name: 'Dr. O. D. Sharma', role: 'HSSE Director & Chief HSE Auditor', email: 'director.hsse@oilindia.in', badge: 'DIR-001' },
    { name: 'R. Davis', role: 'Head of Operational Safety & Rig Compliance', email: 'r.davis@oilindia.in', badge: 'HSE-102' },
    { name: 'P. Barua', role: 'Lead Process Safety & Barrier Assurance', email: 'p.barua@oilindia.in', badge: 'HSE-204' },
    { name: 'M. Gogoi', role: 'Environmental & Industrial Hygiene Lead', email: 'm.gogoi@oilindia.in', badge: 'HSE-311' }
  ],
  assets: [
    { id: 'AST-01', name: 'Assam Asset – Drilling Rig 04', type: 'Deep High-Pressure Exploration Rig', status: 'Active Drilling', riskRating: 'Elevated Risk', activePersonnel: 48, openReports: 12 },
    { id: 'AST-02', name: 'Duliajan Central Processing Facility', type: 'Crude Oil & Natural Gas Refining Unit', status: 'Continuous Production', riskRating: 'Normal Operations', activePersonnel: 124, openReports: 9 },
    { id: 'AST-03', name: 'Digboi Historical Refining Facility', type: 'Petrochemical & Lube Base Oil Plant', status: 'Continuous Production', riskRating: 'Normal Operations', activePersonnel: 82, openReports: 2 },
    { id: 'AST-04', name: 'Moran Gas Compression Station', type: 'High-Volume Booster Compression Field', status: 'Active Compression', riskRating: 'Low Risk', activePersonnel: 36, openReports: 4 },
    { id: 'AST-05', name: 'Naharkatiya Condensate Separation Unit', type: 'Gas Processing & Dehydration Skid', status: 'Active Processing', riskRating: 'Moderate Risk', activePersonnel: 54, openReports: 6 }
  ],
  stats: {
    ltifRate: '0.12',
    daysWithoutLti: 418,
    safetyAuditsCompleted: 486,
    activeAuditors: 142,
    incidentClosureRate: '96.4%'
  }
};

export const MOCK_KNOWLEDGE_RESOURCES = [];

export const MOCK_LOCATION_RISK = MOCK_HIGHEST_RISK_LOCATIONS;
