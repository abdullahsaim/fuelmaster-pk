const router = require('express').Router();
const { getPurchases, createPurchase, updatePurchase, deletePurchase, getPurchaseSummary } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getPurchaseSummary);
router.route('/').get(getPurchases).post(authorize('owner', 'manager'), createPurchase);
router.route('/:id').put(authorize('owner', 'manager'), updatePurchase).delete(authorize('owner'), deletePurchase);

module.exports = router;
