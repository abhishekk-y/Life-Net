const express = require('express');
const router = express.Router();
const {
  getOrgans, getOrgan, createOrgan, updateOrgan, deleteOrgan, matchOrgans,
} = require('../controllers/organController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { organSchema, organUpdateSchema } = require('../utils/validators');

router.use(protect); // All organ routes require authentication

router.route('/')
  .get(authorize('ADMIN', 'HOSPITAL', 'PROCUREMENT_CENTER'), getOrgans)
  .post(authorize('PROCUREMENT_CENTER', 'ADMIN'), validate(organSchema), createOrgan);

router.post('/match', authorize('HOSPITAL', 'ADMIN'), matchOrgans);

router.route('/:id')
  .get(authorize('ADMIN', 'HOSPITAL', 'PROCUREMENT_CENTER'), getOrgan)
  .put(authorize('PROCUREMENT_CENTER', 'ADMIN'), validate(organUpdateSchema), updateOrgan)
  .delete(authorize('ADMIN'), deleteOrgan);

module.exports = router;
