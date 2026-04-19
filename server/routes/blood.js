const express = require('express');
const router = express.Router();
const {
  getBloodUnits, getBloodUnit, createBloodUnit, updateBloodUnit,
  deleteBloodUnit, matchBlood, getBloodSummary,
} = require('../controllers/bloodController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bloodUnitSchema } = require('../utils/validators');

router.use(protect); // All blood routes require authentication

router.get('/summary', getBloodSummary);
router.post('/match', authorize('HOSPITAL', 'ADMIN'), matchBlood);

router.route('/')
  .get(getBloodUnits)
  .post(authorize('BLOOD_BANK', 'ADMIN'), validate(bloodUnitSchema), createBloodUnit);

router.route('/:id')
  .get(getBloodUnit)
  .put(authorize('BLOOD_BANK', 'ADMIN'), updateBloodUnit)
  .delete(authorize('ADMIN'), deleteBloodUnit);

module.exports = router;
