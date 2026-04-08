const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Employee = require('../models/Employee');
const Tank = require('../models/Tank');
const FuelType = require('../models/FuelType');

// @desc    Get complete dashboard data
// @route   GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's sales
    const todaySales = await Sale.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
    ]);

    // Yesterday's sales (for comparison)
    const yesterdaySales = await Sale.aggregate([
      { $match: { date: { $gte: yesterday, $lt: today } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    // Monthly sales
    const monthlySales = await Sale.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' } } },
    ]);

    // Monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    // Credit outstanding
    const creditOutstanding = await Customer.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' }, count: { $sum: { $cond: [{ $gt: ['$balance', 0] }, 1, 0] } } } },
    ]);

    // Supplier payable
    const supplierPayable = await Supplier.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
    ]);

    // Tank levels
    const tanks = await Tank.find().populate('fuelType', 'name code color unit');

    // Fuel types with rates
    const fuelTypes = await FuelType.find({ isActive: true });

    // Employee count
    const employeeCount = await Employee.countDocuments({ status: 'Active' });
    const totalPayroll = await Employee.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: null, total: { $sum: '$salary' } } },
    ]);

    // Last 7 days daily revenue
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const daySales = await Sale.aggregate([
        { $match: { date: { $gte: dayStart, $lt: dayEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      last7Days.push({
        date: dayStart.toISOString().slice(0, 10),
        total: daySales[0]?.total || 0,
      });
    }

    // Recent expenses
    const recentExpenses = await Expense.find().sort({ date: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        todaySales: todaySales[0] || { totalAmount: 0, totalQty: 0, count: 0 },
        yesterdaySales: yesterdaySales[0] || { totalAmount: 0 },
        monthlySales: monthlySales[0] || { totalAmount: 0, totalQty: 0 },
        monthlyExpenses: monthlyExpenses[0] || { totalAmount: 0 },
        creditOutstanding: creditOutstanding[0] || { totalBalance: 0, count: 0 },
        supplierPayable: supplierPayable[0] || { totalBalance: 0 },
        tanks,
        fuelTypes,
        employeeCount,
        totalPayroll: totalPayroll[0]?.total || 0,
        last7Days,
        recentExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get P&L report
// @route   GET /api/dashboard/pnl
exports.getPnL = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate) match.$gte = new Date(startDate);
    if (endDate) match.$lte = new Date(endDate + 'T23:59:59');
    const dateFilter = Object.keys(match).length ? { date: match } : {};

    const totalSales = await Sale.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalPurchases = await Purchase.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalExpenses = await Expense.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    const revenue = totalSales[0]?.total || 0;
    const purchases = totalPurchases[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const grossProfit = revenue - purchases;
    const netProfit = grossProfit - expenses;

    res.json({
      success: true,
      data: { revenue, purchases, expenses, grossProfit, netProfit, margin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
