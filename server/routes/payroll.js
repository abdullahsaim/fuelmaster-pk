const router = require('express').Router();
const { getPayrolls, generatePayroll, updatePayroll, processPayroll, deletePayroll } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');
const { tenantScope, featureGate } = require('../middleware/tenant');

router.use(protect);
router.use(tenantScope);
router.use(featureGate('payroll'));
router.use(authorize('owner', 'manager'));

router.route('/').get(getPayrolls).post(generatePayroll);
router.post('/process', processPayroll);
router.route('/:id').put(updatePayroll).delete(deletePayroll);

module.exports = router;
