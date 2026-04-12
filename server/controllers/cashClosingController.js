const CashClosing = require('../models/CashClosing');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const CreditPayment = require('../models/CreditPayment');
const SupplierPayment = require('../models/SupplierPayment');
const mongoose = require('mongoose');

const tFilter = (req) => req.tenantId ? { tenant: new mongoose.Types.ObjectId(req.tenantId) } : {};
const tQuery = (req) => req.tenantId ? { tenant: req.tenantId } : {};

// @desc    Get all cash closings
exports.getCashClosings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { ...tQuery(req) };
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
exports.populateDay = async (req, res) => {
  try {
    const { date, shift } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const tf = tFilter(req);
    const tq = tQuery(req);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dateMatch = { ...tf, date: { $gte: dayStart, $lt: dayEnd } };
    const shiftMatch = shift && shift !== 'full' ? { shift } : {};

    const cashSalesAgg = await Sale.aggregate([
      { $match: { ...dateMatch, ...shiftMatch, saleType: 'cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const creditAgg = await CreditPayment.aggregate([
      { $match: { ...dateMatch, method: 'Cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const expenseAgg = await Expense.aggregate([
      { $match: { ...dateMatch, paymentMethod: { $in: ['Cash', undefined, null] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const supplierAgg = await SupplierPayment.aggregate([
      { $match: { ...dateMatch, method: 'Cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const lastClosing = await CashClosing.findOne({ ...tq, date: { $lt: dayStart } }).sort({ date: -1 });

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

exports.createCashClosing = async (req, res) => {
  try {
    const data = await CashClosing.create({ ...req.body, tenant: req.tenantId, closedBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCashClosing = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const data = await CashClosing.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCashClosing = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const data = await CashClosing.findOneAndDelete(filter);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
