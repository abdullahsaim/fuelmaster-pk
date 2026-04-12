const router = require('express').Router();
const { getSales, createSale, getSale, deleteSale, getSalesSummary } = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/auth');
const { tenantScope, featureGate } = require('../middleware/tenant');

router.use(protect);
router.use(tenantScope);
router.use(featureGate('sales'));

router.get('/summary', getSalesSummary);
router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSale).delete(authorize('owner', 'manager'), deleteSale);

module.exports = router;
