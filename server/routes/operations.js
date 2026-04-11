const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
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

// ─── Daily Cash Closing ───
router.get('/cash-closing/populate', cashClosing.populateDay);
router.route('/cash-closing').get(cashClosing.getCashClosings).post(cashClosing.createCashClosing);
router.route('/cash-closing/:id').put(cashClosing.updateCashClosing).delete(authorize('owner', 'manager'), cashClosing.deleteCashClosing);

// ─── Shift Handovers ───
router.get('/shift-handovers/populate', shiftHandover.populateShift);
router.route('/shift-handovers').get(shiftHandover.getHandovers).post(shiftHandover.createHandover);
router.put('/shift-handovers/:id/acknowledge', shiftHandover.acknowledgeHandover);
router.delete('/shift-handovers/:id', authorize('owner', 'manager'), shiftHandover.deleteHandover);

// ─── Attendance ───
router.route('/attendance').get(attendance.getAttendance);
router.post('/attendance/bulk', attendance.bulkMark);
router.get('/attendance/summary', attendance.monthlySummary);
router.delete('/attendance/:id', authorize('owner', 'manager'), attendance.deleteAttendance);

// ─── Tank Transfer ───
router.post('/tank-transfer', authorize('owner', 'manager'), tankTransfer.transfer);

// ─── Checklists ───
router.route('/checklists').get(checklist.getChecklists).post(checklist.createChecklist);
router.route('/checklists/:id').put(checklist.updateChecklist).delete(authorize('owner', 'manager'), checklist.deleteChecklist);

module.exports = router;
