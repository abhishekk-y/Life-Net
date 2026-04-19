const { z } = require('zod');

const ROLES = ['ADMIN', 'HOSPITAL', 'BLOOD_BANK', 'PROCUREMENT_CENTER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGAN_TYPES = [
  'HEART', 'LIVER', 'KIDNEY', 'LUNG', 'PANCREAS',
  'INTESTINE', 'CORNEA', 'BONE_MARROW', 'SKIN', 'OTHER',
];

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  role: z.enum(ROLES).optional(),
  organization: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const organSchema = z.object({
  organType: z.enum(ORGAN_TYPES),
  bloodGroup: z.enum(BLOOD_GROUPS),
  donorAge: z.number().min(0).max(120).optional(),
  donorGender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  viabilityHours: z.number().min(1),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

const bloodUnitSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(['WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'PLASMA', 'CRYOPRECIPITATE']).optional(),
  quantity: z.number().min(1),
  units: z.number().min(1).optional(),
  storageTemp: z.number(),
  expiryDate: z.string().or(z.date()),
  donorId: z.string().min(1),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

const requestSchema = z.object({
  type: z.enum(['ORGAN', 'BLOOD']),
  urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
  resourceDetails: z.object({
    bloodGroup: z.string().optional(),
    organType: z.string().optional(),
    component: z.string().optional(),
    quantity: z.number().optional(),
  }),
  patientAge: z.number().min(0).max(120).optional(),
  patientGender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  notes: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  organSchema,
  bloodUnitSchema,
  requestSchema,
};
