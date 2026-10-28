const express = require('express');
const router = express.Router();
const {
  getBloodUnits, getBloodUnit, createBloodUnit, updateBloodUnit,
  deleteBloodUnit, matchBlood, getBloodSummary,
} = require('../controllers/bloodController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bloodUnitSchema, bloodUnitUpdateSchema, bloodMatchSchema } = require('../utils/validators');

router.use(protect); // All blood routes require authentication

router.get('/summary', authorize('BLOOD_BANK', 'HOSPITAL', 'ADMIN'), getBloodSummary);
router.post('/match', authorize('HOSPITAL', 'ADMIN'), validate(bloodMatchSchema), matchBlood);

router.route('/')
  .get(authorize('PATIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'), getBloodUnits)
  .post(authorize('BLOOD_BANK', 'ADMIN'), validate(bloodUnitSchema), createBloodUnit);

router.route('/:id')
  .get(authorize('PATIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'), getBloodUnit)
  .put(authorize('BLOOD_BANK', 'ADMIN'), validate(bloodUnitUpdateSchema), updateBloodUnit)
  .delete(authorize('ADMIN'), deleteBloodUnit);

module.exports = router;
