const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organ = require('../models/Organ');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const connectDB = require('../config/db');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Organ.deleteMany({}),
      BloodUnit.deleteMany({}),
      Request.deleteMany({}),
    ]);

    logger.info('Cleared existing data');

    // ═══════════════════════════════════════════════ USERS
    const users = await User.create([
      {
        name: 'LifeNet Admin',
        email: 'admin@lifenet.com',
        password: 'admin',
        role: 'ADMIN',
        organization: 'LifeNet Central Operations',
        phone: '+91-9999900000',
        address: { city: 'New Delhi', state: 'Delhi', country: 'India' },
      },
      {
        name: 'AIIMS New Delhi',
        email: 'hospital@lifenet.com',
        password: 'hospital123',
        role: 'HOSPITAL',
        organization: 'All India Institute of Medical Sciences',
        phone: '+91-9876543211',
        address: { city: 'New Delhi', state: 'Delhi', country: 'India' },
      },
      {
        name: 'Apollo Hospitals Chennai',
        email: 'apollo@lifenet.com',
        password: 'apollo123',
        role: 'HOSPITAL',
        organization: 'Apollo Hospitals Group',
        phone: '+91-9876543215',
        address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      },
      {
        name: 'Fortis Mumbai',
        email: 'fortis@lifenet.com',
        password: 'fortis123',
        role: 'HOSPITAL',
        organization: 'Fortis Healthcare Mumbai',
        phone: '+91-9876543216',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      },
      {
        name: 'Red Cross Blood Bank',
        email: 'bloodbank@lifenet.com',
        password: 'bloodbank123',
        role: 'BLOOD_BANK',
        organization: 'Indian Red Cross Society Blood Bank',
        phone: '+91-9876543212',
        address: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      },
      {
        name: 'National Blood Centre',
        email: 'nbc@lifenet.com',
        password: 'nbc123',
        role: 'BLOOD_BANK',
        organization: 'National Blood Centre - NHM',
        phone: '+91-9876543217',
        address: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      },
      {
        name: 'NOTTO India',
        email: 'procurement@lifenet.com',
        password: 'procurement123',
        role: 'PROCUREMENT_CENTER',
        organization: 'National Organ & Tissue Transplant Organisation',
        phone: '+91-9876543213',
        address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      },
      {
        name: 'ZOTTO West India',
        email: 'zotto@lifenet.com',
        password: 'zotto123',
        role: 'PROCUREMENT_CENTER',
        organization: 'Zonal Organ & Tissue Transplant Organisation (West)',
        phone: '+91-9876543218',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      },
    ]);

    logger.info(`Created ${users.length} users`);

    const procurement  = users.find(u => u.email === 'procurement@lifenet.com');
    const procurement2 = users.find(u => u.email === 'zotto@lifenet.com');
    const bloodBank    = users.find(u => u.email === 'bloodbank@lifenet.com');
    const bloodBank2   = users.find(u => u.email === 'nbc@lifenet.com');
    const hospital1    = users.find(u => u.email === 'hospital@lifenet.com');
    const hospital2    = users.find(u => u.email === 'apollo@lifenet.com');
    const hospital3    = users.find(u => u.email === 'fortis@lifenet.com');

    const now = new Date();
    const daysAgo  = (d) => new Date(now.getTime() - d * 86400000);
    const daysFrom = (d) => new Date(now.getTime() + d * 86400000);

    // ═══════════════════════════════════════════════ ORGANS (30 organs)
    const organs = await Organ.create([
      // ── KIDNEYs ──
      { organType:'KIDNEY', bloodGroup:'O+',  status:'AVAILABLE', donorAge:28, donorGender:'MALE',   viabilityHours:36, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Chennai',   state:'Tamil Nadu'},     notes:'HLA matched — suitable for national list' },
      { organType:'KIDNEY', bloodGroup:'A+',  status:'AVAILABLE', donorAge:34, donorGender:'FEMALE', viabilityHours:36, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Chennai',   state:'Tamil Nadu'},     notes:'No comorbidities. GFR 95' },
      { organType:'KIDNEY', bloodGroup:'B+',  status:'AVAILABLE', donorAge:41, donorGender:'MALE',   viabilityHours:36, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',    state:'Maharashtra'},    notes:'Cadaveric donor — road accident' },
      { organType:'KIDNEY', bloodGroup:'O-',  status:'AVAILABLE', donorAge:22, donorGender:'FEMALE', viabilityHours:36, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Pune',      state:'Maharashtra'},    notes:'Universal donor — priority listing' },
      { organType:'KIDNEY', bloodGroup:'AB+', status:'RESERVED',  donorAge:45, donorGender:'MALE',   viabilityHours:36, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Bangalore', state:'Karnataka'},      notes:'Reserved for AIIMS patient' },
      { organType:'KIDNEY', bloodGroup:'A-',  status:'AVAILABLE', donorAge:30, donorGender:'MALE',   viabilityHours:36, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(1), location:{city:'Madurai',   state:'Tamil Nadu'},     notes:'Paired exchange candidate' },

      // ── LIVERs ──
      { organType:'LIVER', bloodGroup:'A+',  status:'AVAILABLE', donorAge:35, donorGender:'FEMALE', viabilityHours:24, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Chennai',     state:'Tamil Nadu'},   notes:'Excellent hepatic function — donor BMI 22' },
      { organType:'LIVER', bloodGroup:'O+',  status:'AVAILABLE', donorAge:27, donorGender:'MALE',   viabilityHours:24, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',      state:'Maharashtra'}, notes:'Brain-stem-death confirmed. Split liver possible' },
      { organType:'LIVER', bloodGroup:'B+',  status:'TRANSPLANTED', donorAge:38, donorGender:'MALE', viabilityHours:24, procurementCenter:procurement._id, addedBy:procurement._id,  harvestedAt:daysAgo(3), location:{city:'Hyderabad',   state:'Telangana'},   notes:'Successfully transplanted at KIMS' },
      { organType:'LIVER', bloodGroup:'AB-', status:'AVAILABLE', donorAge:31, donorGender:'FEMALE', viabilityHours:24, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Nagpur',      state:'Maharashtra'}, notes:'Rare AB- — prioritise AB- recipients' },

      // ── HEARTs ──
      { organType:'HEART', bloodGroup:'O+', status:'AVAILABLE', donorAge:22, donorGender:'MALE',   viabilityHours:6, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Delhi',    state:'Delhi'},       notes:'URGENT — 4h viability remaining. Contact AIIMS cardiac team' },
      { organType:'HEART', bloodGroup:'B+', status:'AVAILABLE', donorAge:26, donorGender:'FEMALE', viabilityHours:6, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',   state:'Maharashtra'}, notes:'Ejection fraction 65%. Excellent systolic function' },
      { organType:'HEART', bloodGroup:'A+', status:'TRANSPLANTED', donorAge:29, donorGender:'MALE', viabilityHours:6, procurementCenter:procurement._id, addedBy:procurement._id,  harvestedAt:daysAgo(2), location:{city:'Chennai',  state:'Tamil Nadu'},  notes:'Transplanted at MGM Chennai — successful' },

      // ── LUNGs ──
      { organType:'LUNG', bloodGroup:'O+',  status:'AVAILABLE', donorAge:25, donorGender:'FEMALE', viabilityHours:8, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',    state:'Maharashtra'}, notes:'Bilateral lungs. PaO2/FiO2 ratio >300' },
      { organType:'LUNG', bloodGroup:'A+',  status:'AVAILABLE', donorAge:33, donorGender:'MALE',   viabilityHours:8, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Chennai',   state:'Tamil Nadu'},  notes:'Non-smoker donor. FEV1 predicted >80%' },
      { organType:'LUNG', bloodGroup:'B-',  status:'AVAILABLE', donorAge:20, donorGender:'MALE',   viabilityHours:8, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Kochi',     state:'Kerala'},      notes:'Single lung — right lobe available' },

      // ── PANCREASs ──
      { organType:'PANCREAS', bloodGroup:'O+', status:'AVAILABLE', donorAge:24, donorGender:'MALE',   viabilityHours:20, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Chennai',  state:'Tamil Nadu'},   notes:'Suitable for simultaneous pancreas-kidney (SPK)' },
      { organType:'PANCREAS', bloodGroup:'A+', status:'AVAILABLE', donorAge:31, donorGender:'FEMALE', viabilityHours:20, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',   state:'Maharashtra'},  notes:'Donor HbA1c 5.1% — excellent function expected' },

      // ── CORNEAs ──
      { organType:'CORNEA', bloodGroup:'O+',  status:'AVAILABLE', donorAge:55, donorGender:'MALE',   viabilityHours:336, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(1), location:{city:'Chennai',   state:'Tamil Nadu'},  notes:'Endothelial cell count 2800/mm² — excellent quality' },
      { organType:'CORNEA', bloodGroup:'A+',  status:'AVAILABLE', donorAge:48, donorGender:'FEMALE', viabilityHours:336, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(2), location:{city:'Madurai',   state:'Tamil Nadu'},  notes:'Bilateral donation. LASIK-naïve donor' },
      { organType:'CORNEA', bloodGroup:'B+',  status:'AVAILABLE', donorAge:62, donorGender:'MALE',   viabilityHours:336, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Kolkata',   state:'West Bengal'}, notes:'Stored in McCarey-Kaufman media' },
      { organType:'CORNEA', bloodGroup:'O-',  status:'AVAILABLE', donorAge:44, donorGender:'FEMALE', viabilityHours:336, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(3), location:{city:'Ahmedabad', state:'Gujarat'},     notes:'Suitable for DALK or PK procedure' },

      // ── BONE MARROW ──
      { organType:'BONE_MARROW', bloodGroup:'O+',  status:'AVAILABLE', donorAge:26, donorGender:'FEMALE', viabilityHours:24, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Delhi',     state:'Delhi'},      notes:'10/10 HLA match for registered recipient' },
      { organType:'BONE_MARROW', bloodGroup:'A+',  status:'AVAILABLE', donorAge:32, donorGender:'MALE',   viabilityHours:24, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',    state:'Maharashtra'}, notes:'Unrelated donor via DATRI registry' },
      { organType:'BONE_MARROW', bloodGroup:'B+',  status:'AVAILABLE', donorAge:29, donorGender:'FEMALE', viabilityHours:24, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Bangalore', state:'Karnataka'},   notes:'Peripheral blood stem cells — 8M CD34+ cells/kg' },

      // ── SKIN ──
      { organType:'SKIN', bloodGroup:'O+', status:'AVAILABLE', donorAge:38, donorGender:'MALE',   viabilityHours:720, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(5),  location:{city:'Hyderabad', state:'Telangana'},  notes:'Meshed allograft — for severe burn patients' },
      { organType:'SKIN', bloodGroup:'A+', status:'AVAILABLE', donorAge:41, donorGender:'FEMALE', viabilityHours:720, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(10), location:{city:'Pune',      state:'Maharashtra'}, notes:'Stored at -80°C. Available for immediate dispatch' },

      // ── INTESTINE ──
      { organType:'INTESTINE', bloodGroup:'O+', status:'AVAILABLE', donorAge:19, donorGender:'MALE',   viabilityHours:10, procurementCenter:procurement._id,  addedBy:procurement._id,  harvestedAt:daysAgo(0), location:{city:'Chennai', state:'Tamil Nadu'}, notes:'Isolated small bowel. Donor BSA 1.8m²' },
      { organType:'INTESTINE', bloodGroup:'B+', status:'AVAILABLE', donorAge:24, donorGender:'FEMALE', viabilityHours:10, procurementCenter:procurement2._id, addedBy:procurement2._id, harvestedAt:daysAgo(0), location:{city:'Mumbai',  state:'Maharashtra'}, notes:'Combined liver-intestine graft option' },

      // ── OTHER ──
      { organType:'OTHER', bloodGroup:'AB+', status:'AVAILABLE', donorAge:36, donorGender:'MALE', viabilityHours:48, procurementCenter:procurement._id, addedBy:procurement._id, harvestedAt:daysAgo(1), location:{city:'Jaipur', state:'Rajasthan'}, notes:'Hand/upper limb composite tissue — contact specialist team' },
    ]);

    logger.info(`Created ${organs.length} organs`);

    // ═══════════════════════════════════════════════ BLOOD UNITS (40 units)
    const bloodUnitData = [];

    const banks  = [bloodBank._id, bloodBank2._id];
    const locs   = [
      { city:'Bangalore',   state:'Karnataka' },
      { city:'Hyderabad',   state:'Telangana' },
      { city:'Mumbai',      state:'Maharashtra' },
      { city:'Chennai',     state:'Tamil Nadu' },
      { city:'New Delhi',   state:'Delhi' },
      { city:'Kolkata',     state:'West Bengal' },
      { city:'Pune',        state:'Maharashtra' },
      { city:'Ahmedabad',   state:'Gujarat' },
    ];
    const components = ['WHOLE_BLOOD','PACKED_RBC','PLATELETS','PLASMA','CRYOPRECIPITATE'];
    const groups     = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

    const unitDefs = [
      // O+ — highest demand
      { bg:'O+', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:35, daysBack:0,  loc:0 },
      { bg:'O+', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:30, daysBack:2,  loc:1 },
      { bg:'O+', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:1,  loc:2 },
      { bg:'O+', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:3,  loc:4 },
      { bg:'O+', comp:'PLATELETS',    qty:200, temp:22,  exp:5,  daysBack:0,  loc:0 },
      { bg:'O+', comp:'PLATELETS',    qty:250, temp:22,  exp:4,  daysBack:1,  loc:3 },
      { bg:'O+', comp:'PLASMA',       qty:250, temp:-20, exp:365,daysBack:10, loc:5 },
      // A+
      { bg:'A+', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:35, daysBack:1,  loc:2 },
      { bg:'A+', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:28, daysBack:5,  loc:4 },
      { bg:'A+', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:0,  loc:1 },
      { bg:'A+', comp:'PLATELETS',    qty:200, temp:22,  exp:5,  daysBack:0,  loc:2 },
      { bg:'A+', comp:'PLASMA',       qty:250, temp:-20, exp:365,daysBack:20, loc:6 },
      // B+
      { bg:'B+', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:35, daysBack:0,  loc:3 },
      { bg:'B+', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:20, daysBack:8,  loc:7 },
      { bg:'B+', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:2,  loc:0 },
      { bg:'B+', comp:'PLATELETS',    qty:200, temp:22,  exp:5,  daysBack:1,  loc:1 },
      // AB+
      { bg:'AB+', comp:'WHOLE_BLOOD', qty:450, temp:4,   exp:35, daysBack:2,  loc:4 },
      { bg:'AB+', comp:'PLATELETS',   qty:150, temp:21,  exp:3,  daysBack:0,  loc:2 },
      { bg:'AB+', comp:'PLASMA',      qty:250, temp:-20, exp:365,daysBack:15, loc:5 },
      // O- — universal, critical
      { bg:'O-', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:35, daysBack:0,  loc:0 },
      { bg:'O-', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:35, daysBack:1,  loc:3 },
      { bg:'O-', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:0,  loc:4 },
      { bg:'O-', comp:'PLATELETS',    qty:200, temp:22,  exp:5,  daysBack:0,  loc:6 },
      // A- — low stock
      { bg:'A-', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:3,  loc:3 },
      { bg:'A-', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:30, daysBack:7,  loc:7 },
      // B-
      { bg:'B-', comp:'WHOLE_BLOOD',  qty:450, temp:4,   exp:35, daysBack:0,  loc:2 },
      { bg:'B-', comp:'PACKED_RBC',   qty:300, temp:4,   exp:42, daysBack:5,  loc:5 },
      { bg:'B-', comp:'PLATELETS',    qty:200, temp:22,  exp:5,  daysBack:1,  loc:0 },
      // AB-
      { bg:'AB-', comp:'PLASMA',      qty:250, temp:-20, exp:365,daysBack:30, loc:1 },
      { bg:'AB-', comp:'WHOLE_BLOOD', qty:450, temp:4,   exp:35, daysBack:1,  loc:4 },
      // CRYOPRECIPITATE — for clotting disorders
      { bg:'A+',  comp:'CRYOPRECIPITATE', qty:150, temp:-20, exp:365, daysBack:5, loc:0 },
      { bg:'O+',  comp:'CRYOPRECIPITATE', qty:150, temp:-20, exp:365, daysBack:8, loc:2 },
      // Near-expiry units (for realism)
      { bg:'B+',  comp:'PLATELETS',   qty:200, temp:22, exp:2,  daysBack:3, loc:3, status:'AVAILABLE' },
      { bg:'A+',  comp:'PLATELETS',   qty:180, temp:22, exp:1,  daysBack:4, loc:1, status:'AVAILABLE' },
      { bg:'O+',  comp:'WHOLE_BLOOD', qty:450, temp:4,  exp:5,  daysBack:30,loc:0, status:'AVAILABLE' },
      // Used units
      { bg:'A+',  comp:'PACKED_RBC',  qty:300, temp:4,  exp:42, daysBack:10, loc:2, status:'USED' },
      { bg:'O-',  comp:'WHOLE_BLOOD', qty:450, temp:4,  exp:35, daysBack:15, loc:4, status:'USED' },
      { bg:'B+',  comp:'PLATELETS',   qty:200, temp:22, exp:5,  daysBack:20, loc:0, status:'USED' },
      // Reserved
      { bg:'AB+', comp:'WHOLE_BLOOD', qty:450, temp:4,  exp:35, daysBack:0,  loc:5, status:'RESERVED' },
      { bg:'O+',  comp:'PACKED_RBC',  qty:300, temp:4,  exp:42, daysBack:0,  loc:6, status:'RESERVED' },
    ];

    for (let i = 0; i < unitDefs.length; i++) {
      const u = unitDefs[i];
      const collectedAt = daysAgo(u.daysBack);
      bloodUnitData.push({
        bloodGroup:   u.bg,
        component:    u.comp,
        quantity:     u.qty,
        units:        1,
        storageTemp:  u.temp,
        donorId:      `D-${String(i + 1).padStart(3, '0')}`,
        bloodBank:    banks[i % 2],
        addedBy:      banks[i % 2],
        status:       u.status || 'AVAILABLE',
        collectedAt,
        expiryDate:   new Date(collectedAt.getTime() + u.exp * 86400000),
        location:     locs[u.loc],
      });
    }

    const bloodUnits = await BloodUnit.create(bloodUnitData);
    logger.info(`Created ${bloodUnits.length} blood units`);

    // ═══════════════════════════════════════════════ REQUESTS (15 requests)
    const requests = await Request.create([
      // EMERGENCY blood
      {
        type:'BLOOD', status:'PENDING', urgency:'EMERGENCY',
        resourceDetails:{ bloodGroup:'O-', component:'WHOLE_BLOOD', quantity:2 },
        patientAge:45, patientGender:'MALE',
        requestedBy:hospital1._id, hospital:hospital1._id,
        notes:'Trauma patient — road accident. Immediate transfusion required. Contact duty surgeon Dr. Sharma.',
        createdAt: daysAgo(0),
      },
      // EMERGENCY organ
      {
        type:'ORGAN', status:'PENDING', urgency:'EMERGENCY',
        resourceDetails:{ bloodGroup:'O+', organType:'HEART' },
        patientAge:38, patientGender:'MALE',
        requestedBy:hospital1._id, hospital:hospital1._id,
        notes:'DCM patient — EF 15%. IABP support. Window closing in 6 hours. AIIMS Cardiothoracic team on standby.',
        createdAt: daysAgo(0),
      },
      // URGENT organ
      {
        type:'ORGAN', status:'PENDING', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'A+', organType:'KIDNEY' },
        patientAge:52, patientGender:'FEMALE',
        requestedBy:hospital2._id, hospital:hospital2._id,
        notes:'ESRD Stage 5. On dialysis 3x/week for 4 years. PRA 12%. Next available slot at Apollo Chennai.',
        createdAt: daysAgo(1),
      },
      // URGENT blood
      {
        type:'BLOOD', status:'APPROVED', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'AB-', component:'PLASMA', quantity:4 },
        patientAge:29, patientGender:'FEMALE',
        requestedBy:hospital3._id, hospital:hospital3._id,
        notes:'TTP patient. Requires large-volume plasma exchange. ICU bed 7, Fortis Mumbai.',
        createdAt: daysAgo(1),
      },
      // ROUTINE blood - IN TRANSIT
      {
        type:'BLOOD', status:'IN_TRANSIT', urgency:'ROUTINE',
        resourceDetails:{ bloodGroup:'B+', component:'PACKED_RBC', quantity:2 },
        patientAge:60, patientGender:'MALE',
        requestedBy:hospital1._id, hospital:hospital1._id,
        notes:'Pre-operative transfusion for elective CABG surgery. Scheduled 9:00 AM tomorrow.',
        createdAt: daysAgo(2),
      },
      // ORGAN - IN TRANSIT
      {
        type:'ORGAN', status:'IN_TRANSIT', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'B+', organType:'LIVER' },
        patientAge:44, patientGender:'MALE',
        requestedBy:hospital2._id, hospital:hospital2._id,
        notes:'CLF — Childs C cirrhosis. MELD score 28. Green corridor arranged Chennai → Hyderabad.',
        createdAt: daysAgo(1),
      },
      // MATCHED organ
      {
        type:'ORGAN', status:'MATCHED', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'A+', organType:'LUNG' },
        patientAge:35, patientGender:'FEMALE',
        requestedBy:hospital1._id, hospital:hospital1._id,
        notes:'IPF patient. FVC 42%. Bilateral lung transplant. Match score 94%. Awaiting final crossmatch.',
        createdAt: daysAgo(2),
      },
      // COMPLETED blood
      {
        type:'BLOOD', status:'COMPLETED', urgency:'ROUTINE',
        resourceDetails:{ bloodGroup:'O+', component:'PLATELETS', quantity:6 },
        patientAge:30, patientGender:'MALE',
        requestedBy:hospital3._id, hospital:hospital3._id,
        notes:'Post-chemotherapy thrombocytopenia. Platelet count recovered to 85000. Case closed.',
        createdAt: daysAgo(5),
        completedAt: daysAgo(3),
      },
      // COMPLETED organ
      {
        type:'ORGAN', status:'COMPLETED', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'AB+', organType:'KIDNEY' },
        patientAge:48, patientGender:'FEMALE',
        requestedBy:hospital2._id, hospital:hospital2._id,
        notes:'Successful transplant at Apollo Chennai. Creatinine 0.9 on Day 5 post-op. Patient stable.',
        createdAt: daysAgo(7),
        completedAt: daysAgo(4),
      },
      // REJECTED
      {
        type:'BLOOD', status:'REJECTED', urgency:'ROUTINE',
        resourceDetails:{ bloodGroup:'A-', component:'WHOLE_BLOOD', quantity:1 },
        patientAge:25, patientGender:'FEMALE',
        requestedBy:hospital1._id, hospital:hospital1._id,
        notes:'Request rejected — patient haemoglobin normalised with oral iron. No transfusion required.',
        createdAt: daysAgo(4),
      },
      // More PENDING
      {
        type:'BLOOD', status:'PENDING', urgency:'ROUTINE',
        resourceDetails:{ bloodGroup:'A+', component:'CRYOPRECIPITATE', quantity:10 },
        patientAge:55, patientGender:'MALE',
        requestedBy:hospital2._id, hospital:hospital2._id,
        notes:'Haemophilia A patient. Factor VIII supplementation for elective dental procedure.',
        createdAt: daysAgo(0),
      },
      {
        type:'ORGAN', status:'PENDING', urgency:'ROUTINE',
        resourceDetails:{ bloodGroup:'O+', organType:'CORNEA' },
        patientAge:18, patientGender:'FEMALE',
        requestedBy:hospital3._id, hospital:hospital3._id,
        notes:"Keratoconus — stage IV. Vision 6/60 OU. Waiting list at Maharashtra Eye Bank for 8 months.",
        createdAt: daysAgo(3),
      },
      {
        type:'BLOOD', status:'APPROVED', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'O-', component:'PACKED_RBC', quantity:3 },
        patientAge:32, patientGender:'FEMALE',
        requestedBy:hospital1._id, hospital:hospital1._id,
        notes:'PPH — post-partum haemorrhage. Blood loss 2L. ICU stabilised. Blood allocated from Red Cross.',
        createdAt: daysAgo(1),
      },
      {
        type:'ORGAN', status:'PENDING', urgency:'URGENT',
        resourceDetails:{ bloodGroup:'B-', organType:'PANCREAS' },
        patientAge:22, patientGender:'MALE',
        requestedBy:hospital2._id, hospital:hospital2._id,
        notes:'Type 1 DM since age 6. C-peptide negative. SPK preferred — paired kidney available at same center.',
        createdAt: daysAgo(2),
      },
      {
        type:'BLOOD', status:'COMPLETED', urgency:'EMERGENCY',
        resourceDetails:{ bloodGroup:'B+', component:'WHOLE_BLOOD', quantity:4 },
        patientAge:68, patientGender:'MALE',
        requestedBy:hospital3._id, hospital:hospital3._id,
        notes:'GI bleed — duodenal ulcer perforation. Emergency surgery successful. Discharged Day 6.',
        createdAt: daysAgo(10),
        completedAt: daysAgo(8),
      },
    ]);

    logger.info(`Created ${requests.length} requests`);
    logger.info('✅ Database seeded with rich realistic data!');
    logger.info('');
    logger.info('📊 Summary:');
    logger.info(`   Users:      ${users.length}`);
    logger.info(`   Organs:     ${organs.length}`);
    logger.info(`   Blood Units: ${bloodUnits.length}`);
    logger.info(`   Requests:   ${requests.length}`);
    logger.info('');
    logger.info('📝 Login Credentials:');
    logger.info('───────────────────────────────────────────');
    logger.info('Admin:        admin@lifenet.com       / admin');
    logger.info('Hospital:     hospital@lifenet.com    / hospital123');
    logger.info('Apollo:       apollo@lifenet.com      / apollo123');
    logger.info('Fortis:       fortis@lifenet.com      / fortis123');
    logger.info('Blood Bank:   bloodbank@lifenet.com   / bloodbank123');
    logger.info('NBC:          nbc@lifenet.com         / nbc123');
    logger.info('Procurement:  procurement@lifenet.com / procurement123');
    logger.info('───────────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seedData();
