const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenant');
const tenant = require('../controllers/tenantController');

// All admin routes require superadmin
router.use(protect);
router.use(tenantScope);
router.use(authorize('superadmin'));

router.route('/tenants')
  .get(tenant.getAllTenants);

router.route('/tenants/:id')
  .get(tenant.getTenant)
  .put(tenant.updateTenant)
  .delete(tenant.deleteTenant);

router.post('/tenants/:id/payment', tenant.recordPayment);

module.exports = router;
