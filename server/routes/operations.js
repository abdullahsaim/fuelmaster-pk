const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const reading = require('../controllers/readingController');
const dip = require('../controllers/dipController');
const payment = require('../controllers/paymentController');
const history = require('../controllers/historyController');
const createCrudController = require('../controllers/crudFactory');
const Pump = require('../models/Pump');

router.use(protect);

// ─── Readings (per-shift nozzle meter readings) ───
router.route('/readings').get(reading.list).post(reading.create);
router.route('/readings/:id').delete(authorize('owner', 'manager'), reading.remove);

// ─── Tank dips (physical stock checks) ───
router.route('/dips').get(dip.list).post(dip.create);
router.route('/dips/:id').delete(authorize('owner', 'manager'), dip.remove);

// ─── Customer credit payments ───
router.route('/credit-payments').get(payment.listCreditPayments).post(payment.createCreditPayment);
router.route('/credit-payments/:id').delete(authorize('owner', 'manager'), payment.deleteCreditPayment);
router.get('/customers/:id/ledger', payment.customerLedger);

// ─── Supplier payments ───
router.route('/supplier-payments').get(payment.listSupplierPayments).post(payment.createSupplierPayment);
router.route('/supplier-payments/:id').delete(authorize('owner', 'manager'), payment.deleteSupplierPayment);

// ─── Pumps (group nozzles by physical pump) ───
const pumpCtrl = createCrudController(Pump, 'nozzles');
router.route('/pumps').get(pumpCtrl.getAll).post(authorize('owner', 'manager'), pumpCtrl.create);
router.route('/pumps/:id').get(pumpCtrl.getOne).put(authorize('owner', 'manager'), pumpCtrl.update).delete(authorize('owner'), pumpCtrl.remove);

// ─── Unified history feed and stock ledger ───
router.get('/history', history.feed);
router.get('/stock-movements', history.stockMovements);

module.exports = router;
