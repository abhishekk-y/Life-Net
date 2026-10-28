const { z } = require('zod');

const REGISTRABLE_ROLES = ['PATIENT', 'DOCTOR', 'HOSPITAL', 'PHARMACY', 'SUPPLIER', 'BLOOD_BANK', 'PROCUREMENT_CENTER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGAN_TYPES = [
  'HEART', 'LIVER', 'KIDNEY', 'LUNG', 'PANCREAS',
  'INTESTINE', 'CORNEA', 'BONE_MARROW', 'SKIN', 'OTHER',
];

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
  role: z.enum(REGISTRABLE_ROLES).optional(),
  organization: z.string().trim().max(160).optional().default(''),
  providerDetails: z.object({
    specialty: z.string().trim().max(120).optional(),
    qualification: z.string().trim().max(160).optional(),
    registrationNumber: z.string().trim().max(100).optional(),
  }).optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
}).superRefine((user, context) => {
  const role = user.role || 'PATIENT';
  if (role !== 'PATIENT' && user.organization.length < 2) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['organization'], message: 'Organization or practice name is required' });
  }
  if (role !== 'PATIENT' && !user.providerDetails?.registrationNumber?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['providerDetails', 'registrationNumber'], message: 'License or registration number is required for review' });
  }
  if (role === 'DOCTOR' && (!user.providerDetails?.specialty?.trim() || !user.providerDetails?.qualification?.trim())) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['providerDetails'], message: 'Specialty and qualification are required for verification' });
  }
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(128),
}).refine((input) => input.currentPassword !== input.newPassword, {
  path: ['newPassword'],
  message: 'Choose a password different from your current one',
});
const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(32).optional().default(''),
  address: z.object({
    street: z.string().trim().max(160).optional().default(''),
    city: z.string().trim().max(100).optional().default(''),
    state: z.string().trim().max(100).optional().default(''),
    zipCode: z.string().trim().max(24).optional().default(''),
    country: z.string().trim().max(100).optional().default('India'),
  }).optional(),
});
const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
});
const passwordResetSchema = z.object({ token: z.string().min(32).max(256), newPassword: z.string().min(12).max(128) });
const emailVerificationSchema = z.object({ token: z.string().min(32).max(256) });
const resendEmailVerificationSchema = z.object({ email: z.string().trim().email().transform((email) => email.toLowerCase()) });

const organSchema = z.object({
  organType: z.enum(ORGAN_TYPES),
  bloodGroup: z.enum(BLOOD_GROUPS),
  harvestedAt: z.coerce.date().refine((date) => date <= new Date(), 'Harvest time cannot be in the future'),
  viabilityHours: z.number().min(1),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().max(500).optional(),
}).refine((record) => record.harvestedAt.getTime() + record.viabilityHours * 3600000 > Date.now(), {
  path: ['viabilityHours'],
  message: 'The reported viability window has already elapsed',
});
const organUpdateSchema = z.object({
  status: z.enum(['EXPIRED']).optional(),
  location: z.object({ city: z.string().optional(), state: z.string().optional(), country: z.string().optional() }).optional(),
  notes: z.string().max(500).optional(),
});

const bloodUnitFields = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(['WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'PLASMA', 'CRYOPRECIPITATE']),
  quantity: z.number().min(1),
  units: z.number().int().min(1).max(500),
  collectedAt: z.coerce.date().refine((date) => date <= new Date(), 'Collection date cannot be in the future'),
  storageTemp: z.number(),
  expiryDate: z.coerce.date(),
  donorId: z.string().max(100).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});
const bloodUnitSchema = bloodUnitFields.refine((record) => record.expiryDate >= record.collectedAt, {
  path: ['expiryDate'],
  message: 'Expiry date must be on or after the collection date',
});
const bloodUnitUpdateSchema = bloodUnitFields.partial().extend({
  status: z.enum(['AVAILABLE', 'EXPIRED', 'DISCARDED']).optional(),
}).refine((record) => !record.expiryDate || !record.collectedAt || record.expiryDate >= record.collectedAt, {
  path: ['expiryDate'],
  message: 'Expiry date must be on or after the collection date',
});
const bloodMatchSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(['WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'PLASMA', 'CRYOPRECIPITATE']).optional(),
  quantity: z.number().int().min(1).max(500).optional(),
  location: z.object({ city: z.string().max(100).optional(), state: z.string().max(100).optional() }).optional(),
});

const requestSchema = z.object({
  type: z.enum(['ORGAN', 'BLOOD']),
  urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
  resourceDetails: z.object({
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    organType: z.enum(ORGAN_TYPES).optional(),
    component: z.enum(['WHOLE_BLOOD', 'PACKED_RBC', 'PLATELETS', 'PLASMA', 'CRYOPRECIPITATE']).optional(),
    quantity: z.number().int().min(1).max(500).optional(),
  }),
  notes: z.string().max(500).optional(),
}).superRefine((request, context) => {
  if (request.type === 'BLOOD' && !request.resourceDetails.bloodGroup) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['resourceDetails', 'bloodGroup'], message: 'Blood group is required for a blood request' });
  }
  if (request.type === 'BLOOD' && !request.resourceDetails.component) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['resourceDetails', 'component'], message: 'Blood component is required for a blood request' });
  }
  if (request.type === 'ORGAN' && (!request.resourceDetails.organType || !request.resourceDetails.bloodGroup)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['resourceDetails'], message: 'Organ type and blood group are required' });
  }
});

const assignResourceSchema = z.object({
  resourceId: z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid inventory listing'),
});

const doctorProfileSchema = z.object({
  specialty: z.string().trim().min(2).max(120),
  qualification: z.string().trim().min(2).max(160),
  experienceYears: z.number().min(0).max(70),
  consultationFee: z.number().min(0).max(100000),
  bio: z.string().max(1200).optional().default(''),
  languages: z.array(z.string().trim().min(2).max(40)).max(10).optional().default([]),
  address: z.object({ city: z.string().trim().min(2).max(100), state: z.string().trim().max(100).optional(), country: z.string().trim().max(100).optional() }),
  acceptingAppointments: z.boolean().optional().default(true),
});

const appointmentSlotSchema = z.object({ startAt: z.coerce.date(), endAt: z.coerce.date() });
const appointmentBookingSchema = z.object({
  doctorId: z.string().regex(/^[a-f\d]{24}$/i),
  slotId: z.string().regex(/^[a-f\d]{24}$/i),
});
const appointmentUpdateSchema = z.object({ action: z.enum(['CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']) });

const pharmacyListingSchema = z.object({
  medicineName: z.string().trim().min(2).max(160),
  activeIngredient: z.string().trim().min(2).max(160),
  strength: z.string().trim().min(1).max(80),
  dosageForm: z.string().trim().min(2).max(80),
  packSize: z.string().trim().min(1).max(80),
  manufacturer: z.string().trim().max(120).optional().default(''),
  price: z.number().min(0).max(10000000),
  stockQuantity: z.number().int().min(0).max(100000),
  expiresAt: z.coerce.date().optional(),
  active: z.boolean().optional().default(true),
});
const pharmacyOrderSchema = z.object({ listingId: z.string().regex(/^[a-f\d]{24}$/i), quantity: z.number().int().min(1).max(1000) });
const pharmacyOrderUpdateSchema = z.object({ action: z.enum(['CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']) });
const supplierListingSchema = z.object({
  productName: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  description: z.string().max(1200).optional().default(''),
  unit: z.string().trim().min(1).max(80),
  unitPrice: z.number().min(0).max(100000000),
  stockQuantity: z.number().int().min(0).max(10000000),
  leadTimeDays: z.number().int().min(0).max(365),
  active: z.boolean().optional().default(true),
});
const supplyOrderSchema = z.object({ listingId: z.string().regex(/^[a-f\d]{24}$/i), quantity: z.number().int().min(1).max(100000) });
const supplyOrderUpdateSchema = z.object({ action: z.enum(['CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']) });

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  profileUpdateSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  resendEmailVerificationSchema,
  organSchema,
  organUpdateSchema,
  bloodUnitSchema,
  bloodUnitUpdateSchema,
  bloodMatchSchema,
  requestSchema,
  assignResourceSchema,
  doctorProfileSchema,
  appointmentSlotSchema,
  appointmentBookingSchema,
  appointmentUpdateSchema,
  pharmacyListingSchema,
  pharmacyOrderSchema,
  pharmacyOrderUpdateSchema,
  supplierListingSchema,
  supplyOrderSchema,
  supplyOrderUpdateSchema,
};
