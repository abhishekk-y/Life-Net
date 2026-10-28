const express = require('express');
const router = express.Router();
const { getCenters, updateVerification } = require('../controllers/centersController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getCenters);
router.patch('/:id/verification', authorize('ADMIN'), updateVerification);

module.exports = router;
