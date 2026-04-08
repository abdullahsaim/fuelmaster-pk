const router = require('express').Router();
const { protect } = require('../middleware/auth');
const r = require('../controllers/reportsController');

router.use(protect);

router.get('/sales',             r.salesReport);
router.get('/purchases',         r.purchaseReport);
router.get('/day-summary',       r.daySummary);
router.get('/shift',             r.shiftReport);
router.get('/stock',             r.stockReport);
router.get('/credit-aging',      r.creditAging);
router.get('/expenses',          r.expenseReport);
router.get('/fuel-profit',       r.fuelProfitability);
router.get('/variance',          r.varianceReport);
router.get('/monthly-trend',     r.monthlyTrend);
router.get('/customer/:id',      r.customerStatement);
router.get('/supplier/:id',      r.supplierStatement);

module.exports = router;
