const CashClosing = require('../models/CashClosing');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const CreditPayment = require('../models/CreditPayment');
const SupplierPayment = require('../models/SupplierPayment');

// @desc    Get all cash closings
// @route   GET /api/cash-closing
exports.getCashClosings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const data = await CashClosing.find(filter)
      .populate('closedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auto-populate cash figures for a given date
// @route   GET /api/cash-closing/populate?date=YYYY-MM-DD&shift=full
exports.populateDay = async (req, res) => {
  try {
    const { date, shift } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dateMatch = { date: { $gte: dayStart, $lt: dayEnd } };
    const shiftMatch = shift && shift !== 'full' ? { shift } : {};

    // Cash sales (saleType: cash)
    const cashSalesAgg = await Sale.aggregate([
      { $match: { ...dateMatch, ...shiftMatch, saleType: 'cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Credit collected
    const creditAgg = await CreditPayment.aggregate([
      { $match: { date: { $gte: dayStart, $lt: dayEnd }, method: 'Cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Expenses (cash only)
    const expenseAgg = await Expense.aggregate([
      { $match: { ...dateMatch, paymentMethod: { $in: ['Cash', undefined, null] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Supplier payments (cash)
    const supplierAgg = await SupplierPayment.aggregate([
      { $match: { date: { $gte: dayStart, $lt: dayEnd }, method: 'Cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Get last closing's actual cash as today's opening
    const lastClosing = await CashClosing.findOne({ date: { $lt: dayStart } }).sort({ date: -1 });

    res.json({
      success: true,
      data: {
        date,
        cashSales: cashSalesAgg[0]?.total || 0,
        creditCollected: creditAgg[0]?.total || 0,
        expenses: expenseAgg[0]?.total || 0,
        supplierPayments: supplierAgg[0]?.total || 0,
        openingCash: lastClosing?.actualCash || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create cash closing
// @route   POST /api/cash-closing
exports.createCashClosing = async (req, res) => {
  try {
    const data = await CashClosing.create({ ...req.body, closedBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cash closing
// @route   PUT /api/cash-closing/:id
exports.updateCashClosing = async (req, res) => {
  try {
    const data = await CashClosing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete cash closing
// @route   DELETE /api/cash-closing/:id
exports.deleteCashClosing = async (req, res) => {
  try {
    const data = await CashClosing.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
