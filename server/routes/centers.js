const express = require('express');
const router = express.Router();
const { getCenters, getHospitals, updateVerification } = require('../controllers/centersController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/hospitals', getHospitals);
router.get('/', getCenters);
router.patch('/:id/verification', authorize('ADMIN'), updateVerification);

module.exports = router;
