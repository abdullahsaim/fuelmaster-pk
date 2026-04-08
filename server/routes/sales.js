const router = require('express').Router();
const { getSales, createSale, getSale, deleteSale, getSalesSummary } = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getSalesSummary);
router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSale).delete(authorize('owner', 'manager'), deleteSale);
// (sales are immutable except by delete + recreate)

module.exports = router;
