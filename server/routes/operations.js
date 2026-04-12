const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { tenantScope, featureGate, limitCheck } = require('../middleware/tenant');
const reading = require('../controllers/readingController');
const dip = require('../controllers/dipController');
const payment = require('../controllers/paymentController');
const history = require('../controllers/historyController');
const cashClosing = require('../controllers/cashClosingController');
const shiftHandover = require('../controllers/shiftHandoverController');
const attendance = require('../controllers/attendanceController');
const tankTransfer = require('../controllers/tankTransferController');
const checklist = require('../controllers/checklistController');
const createCrudController = require('../controllers/crudFactory');
const Pump = require('../models/Pump');

router.use(protect);
router.use(tenantScope);

// ─── Readings (per-shift nozzle meter readings) ───
router.route('/readings').get(featureGate('readings'), reading.list).post(featureGate('readings'), reading.create);
router.route('/readings/:id').delete(featureGate('readings'), authorize('owner', 'manager'), reading.remove);

// ─── Tank dips (physical stock checks) ───
router.route('/dips').get(featureGate('dips'), dip.list).post(featureGate('dips'), dip.create);
router.route('/dips/:id').delete(featureGate('dips'), authorize('owner', 'manager'), dip.remove);

// ─── Customer credit payments ───
router.route('/credit-payments').get(featureGate('credit'), payment.listCreditPayments).post(featureGate('credit'), payment.createCreditPayment);
router.route('/credit-payments/:id').delete(featureGate('credit'), authorize('owner', 'manager'), payment.deleteCreditPayment);
router.get('/customers/:id/ledger', featureGate('credit'), payment.customerLedger);

// ─── Supplier payments ───
router.route('/supplier-payments').get(featureGate('supplier_payments'), payment.listSupplierPayments).post(featureGate('supplier_payments'), payment.createSupplierPayment);
router.route('/supplier-payments/:id').delete(featureGate('supplier_payments'), authorize('owner', 'manager'), payment.deleteSupplierPayment);

// ─── Pumps (group nozzles by physical pump) ───
const pumpCtrl = createCrudController(Pump, 'nozzles');
router.route('/pumps').get(featureGate('pumps'), pumpCtrl.getAll).post(featureGate('pumps'), authorize('owner', 'manager'), limitCheck(Pump, 'maxPumps'), pumpCtrl.create);
router.route('/pumps/:id').get(featureGate('pumps'), pumpCtrl.getOne).put(featureGate('pumps'), authorize('owner', 'manager'), pumpCtrl.update).delete(featureGate('pumps'), authorize('owner'), pumpCtrl.remove);

// ─── Unified history feed and stock ledger ───
router.get('/history', featureGate('history'), history.feed);
router.get('/stock-movements', featureGate('history'), history.stockMovements);

// ─── Daily Cash Closing ───
router.get('/cash-closing/populate', featureGate('cash_closing'), cashClosing.populateDay);
router.route('/cash-closing').get(featureGate('cash_closing'), cashClosing.getCashClosings).post(featureGate('cash_closing'), cashClosing.createCashClosing);
router.route('/cash-closing/:id').put(featureGate('cash_closing'), cashClosing.updateCashClosing).delete(featureGate('cash_closing'), authorize('owner', 'manager'), cashClosing.deleteCashClosing);

// ─── Shift Handovers ───
router.get('/shift-handovers/populate', featureGate('shift_handover'), shiftHandover.populateShift);
router.route('/shift-handovers').get(featureGate('shift_handover'), shiftHandover.getHandovers).post(featureGate('shift_handover'), shiftHandover.createHandover);
router.put('/shift-handovers/:id/acknowledge', featureGate('shift_handover'), shiftHandover.acknowledgeHandover);
router.delete('/shift-handovers/:id', featureGate('shift_handover'), authorize('owner', 'manager'), shiftHandover.deleteHandover);

// ─── Attendance ───
router.route('/attendance').get(featureGate('attendance'), attendance.getAttendance);
router.post('/attendance/bulk', featureGate('attendance'), attendance.bulkMark);
router.get('/attendance/summary', featureGate('attendance'), attendance.monthlySummary);
router.delete('/attendance/:id', featureGate('attendance'), authorize('owner', 'manager'), attendance.deleteAttendance);

// ─── Tank Transfer ───
router.post('/tank-transfer', featureGate('tank_transfer'), authorize('owner', 'manager'), tankTransfer.transfer);

// ─── Checklists ───
router.route('/checklists').get(featureGate('checklist'), checklist.getChecklists).post(featureGate('checklist'), checklist.createChecklist);
router.route('/checklists/:id').put(featureGate('checklist'), checklist.updateChecklist).delete(featureGate('checklist'), authorize('owner', 'manager'), checklist.deleteChecklist);

module.exports = router;
