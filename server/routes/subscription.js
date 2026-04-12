const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenant');
const tenant = require('../controllers/tenantController');

// Public
router.get('/packages', tenant.getPackages);

// Tenant owner routes
router.get('/', protect, tenantScope, tenant.getMySubscription);
router.put('/profile', protect, tenantScope, authorize('owner', 'superadmin'), tenant.updateProfile);

module.exports = router;
