const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Tank = require('../models/Tank');
const Reading = require('../models/Reading');
const Dip = require('../models/Dip');
const CreditPayment = require('../models/CreditPayment');
const SupplierPayment = require('../models/SupplierPayment');
const mongoose = require('mongoose');

// Helper: build a date filter from query params
const dateRange = (q) => {
  const f = {};
  if (q.startDate) f.$gte = new Date(q.startDate);
  if (q.endDate)   f.$lte = new Date(q.endDate + 'T23:59:59');
  return Object.keys(f).length ? { date: f } : {};
};

// Tenant filter for aggregations
const tFilter = (req) => req.tenantId ? { tenant: new mongoose.Types.ObjectId(req.tenantId) } : {};
const tQuery = (req) => req.tenantId ? { tenant: req.tenantId } : {};

// ─── 1. Sales Report ─────────────────────────────────────────────
exports.salesReport = async (req, res) => {
  try {
    const match = { ...tFilter(req), ...dateRange(req.query) };

    const [byFuel, bySaleType, byShift, daily, topCustomers, totals] = await Promise.all([
      Sale.aggregate([
        { $match: match },
        { $group: { _id: '$fuelType', qty: { $sum: '$quantity' }, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'fueltypes', localField: '_id', foreignField: '_id', as: 'fuel' } },
        { $unwind: { path: '$fuel', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$fuel.name', code: '$fuel.code', color: '$fuel.color', unit: '$fuel.unit', qty: 1, amount: 1, count: 1 } },
        { $sort: { amount: -1 } },
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: '$saleType', amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: '$shift', amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Sale.aggregate([
        { $match: { ...match, saleType: 'credit', customer: { $ne: null } } },
        { $group: { _id: '$customer', amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } },
        { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'c' } },
        { $unwind: '$c' },
        { $project: { name: '$c.name', type: '$c.type', amount: 1, qty: 1, count: 1 } },
        { $sort: { amount: -1 } }, { $limit: 15 },
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: null, amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ success: true, data: {
      totals: totals[0] || { amount: 0, qty: 0, count: 0 },
      byFuel, bySaleType, byShift, daily, topCustomers,
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 2. Purchase Report ──────────────────────────────────────────
exports.purchaseReport = async (req, res) => {
  try {
    const match = { ...tFilter(req), ...dateRange(req.query) };

    const [bySupplier, byFuel, byStatus, daily, totals] = await Promise.all([
      Purchase.aggregate([
        { $match: match },
        { $group: { _id: '$supplier', qty: { $sum: '$quantity' }, received: { $sum: '$receivedQuantity' }, shortage: { $sum: '$shortage' }, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 's' } },
        { $unwind: { path: '$s', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$s.name', city: '$s.city', qty: 1, received: 1, shortage: 1, amount: 1, count: 1 } },
        { $sort: { amount: -1 } },
      ]),
      Purchase.aggregate([
        { $match: match },
        { $group: { _id: '$fuelType', qty: { $sum: '$quantity' }, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'fueltypes', localField: '_id', foreignField: '_id', as: 'f' } },
        { $unwind: { path: '$f', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$f.name', color: '$f.color', unit: '$f.unit', qty: 1, amount: 1, count: 1 } },
        { $sort: { amount: -1 } },
      ]),
      Purchase.aggregate([
        { $match: match },
        { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Purchase.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Purchase.aggregate([
        { $match: match },
        { $group: { _id: null, amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, received: { $sum: '$receivedQuantity' }, shortage: { $sum: '$shortage' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ success: true, data: {
      totals: totals[0] || { amount: 0, qty: 0, received: 0, shortage: 0, count: 0 },
      bySupplier, byFuel, byStatus, daily,
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 3. Day Summary ───────
exports.daySummary = async (req, res) => {
  try {
    const tf = tFilter(req);
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(dateStr); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const range = { ...tf, date: { $gte: start, $lt: end } };

    const [sales, salesByShift, salesByFuel, purchases, expenses, readings, dips, creditPayments, supplierPayments] = await Promise.all([
      Sale.aggregate([{ $match: range }, { $group: { _id: null, amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 },
        cash:   { $sum: { $cond: [{ $eq: ['$saleType','cash'] },   '$amount', 0] } },
        credit: { $sum: { $cond: [{ $eq: ['$saleType','credit'] }, '$amount', 0] } } } }]),
      Sale.aggregate([{ $match: range }, { $group: { _id: '$shift', amount: { $sum: '$amount' }, qty: { $sum: '$quantity' } } }]),
      Sale.aggregate([
        { $match: range },
        { $group: { _id: '$fuelType', qty: { $sum: '$quantity' }, amount: { $sum: '$amount' } } },
        { $lookup: { from: 'fueltypes', localField: '_id', foreignField: '_id', as: 'f' } },
        { $unwind: { path: '$f', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$f.name', color: '$f.color', unit: '$f.unit', qty: 1, amount: 1 } },
      ]),
      Purchase.aggregate([{ $match: range }, { $group: { _id: null, amount: { $sum: '$amount' }, qty: { $sum: '$quantity' }, count: { $sum: 1 } } }]),
      Expense.aggregate([{ $match: range }, { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Reading.aggregate([{ $match: range }, { $group: { _id: null, dispensed: { $sum: '$dispensed' }, amount: { $sum: '$amount' }, declared: { $sum: '$cashDeclared' }, shortExcess: { $sum: '$shortExcess' }, count: { $sum: 1 } } }]),
      Dip.aggregate([{ $match: range }, { $group: { _id: null, variance: { $sum: '$variance' }, count: { $sum: 1 } } }]),
      CreditPayment.aggregate([{ $match: range }, { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      SupplierPayment.aggregate([{ $match: range }, { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    ]);

    const s = sales[0] || { amount: 0, qty: 0, count: 0, cash: 0, credit: 0 };
    const p = purchases[0] || { amount: 0, qty: 0, count: 0 };
    const e = expenses[0] || { amount: 0, count: 0 };
    const r = readings[0] || { dispensed: 0, amount: 0, declared: 0, shortExcess: 0, count: 0 };
    const d = dips[0] || { variance: 0, count: 0 };
    const cp = creditPayments[0] || { amount: 0, count: 0 };
    const sp = supplierPayments[0] || { amount: 0, count: 0 };

    const cashIn = s.cash + cp.amount;
    const cashOut = sp.amount + e.amount;
    const cashPosition = cashIn - cashOut;

    res.json({ success: true, data: {
      date: dateStr,
      sales: s, salesByShift, salesByFuel,
      purchases: p, expenses: e, readings: r, dips: d,
      creditCollected: cp, supplierPaid: sp,
      cash: { in: cashIn, out: cashOut, net: cashPosition },
      grossProfit: s.amount - p.amount,
    }});
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── 4. Shift Report ─────────
exports.shiftReport = async (req, res) => {
  try {
    const tq = tQuery(req);
    const match = { ...tFilter(req), ...dateRange(req.query) };
    if (req.query.shift) match.shift = req.query.shift;

    const readings = await Reading.find({ ...tq, ...dateRange(req.query), ...(req.query.shift ? { shift: req.query.shift } : {}) })
      .populate('nozzle', 'name')
      .populate('pump', 'name')
      .populate('fuelType', 'name code color unit')
      .populate('operator', 'name')
      .sort({ date: -1 });

    const totals = readings.reduce((a, r) => {
      a.dispensed += r.dispensed || 0;
      a.amount += r.amount || 0;
      a.declared += r.cashDeclared || 0;
      a.shortExcess += r.shortExcess || 0;
      a.testing += r.testing || 0;
      return a;
    }, { dispensed: 0, amount: 0, declared: 0, shortExcess: 0, testing: 0, count: readings.length });

    const byOperator = {};
    readings.forEach(r => {
      const key = r.operator?.name || 'Unassigned';
      if (!byOperator[key]) byOperator[key] = { name: key, dispensed: 0, amount: 0, declared: 0, shortExcess: 0, count: 0 };
      byOperator[key].dispensed += r.dispensed || 0;
      byOperator[key].amount += r.amount || 0;
      byOperator[key].declared += r.cashDeclared || 0;
      byOperator[key].shortExcess += r.shortExcess || 0;
      byOperator[key].count++;
    });

    res.json({ success: true, data: { totals, readings, byOperator: Object.values(byOperator).sort((a,b)=>b.amount-a.amount) }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 5. Stock / Inventory Report ─────────────────────────────────
exports.stockReport = async (req, res) => {
  try {
    const tf = tFilter(req);
    const tq = tQuery(req);
    const tanks = await Tank.find(tq).populate('fuelType', 'name code color unit currentRate').lean();

    const match = { ...tf, ...dateRange(req.query) };
    const tankIds = tanks.map(t => t._id);

    const purchasedAgg = await Purchase.aggregate([
      { $match: { ...match, tank: { $in: tankIds } } },
      { $group: { _id: '$tank', received: { $sum: '$receivedQuantity' }, qty: { $sum: '$quantity' }, amount: { $sum: '$amount' } } },
    ]);
    const soldAgg = await Sale.aggregate([
      { $match: { ...match, tank: { $in: tankIds } } },
      { $group: { _id: '$tank', qty: { $sum: '$quantity' }, amount: { $sum: '$amount' } } },
    ]);
    const dispensedAgg = await Reading.aggregate([
      { $match: { ...match, tank: { $in: tankIds } } },
      { $group: { _id: '$tank', dispensed: { $sum: '$dispensed' }, amount: { $sum: '$amount' } } },
    ]);
    const dipAgg = await Dip.aggregate([
      { $match: { ...match, tank: { $in: tankIds } } },
      { $group: { _id: '$tank', variance: { $sum: '$variance' }, count: { $sum: 1 } } },
    ]);

    const purchasedMap = Object.fromEntries(purchasedAgg.map(x => [String(x._id), x]));
    const soldMap = Object.fromEntries(soldAgg.map(x => [String(x._id), x]));
    const dispensedMap = Object.fromEntries(dispensedAgg.map(x => [String(x._id), x]));
    const dipMap = Object.fromEntries(dipAgg.map(x => [String(x._id), x]));

    const data = tanks.map(t => {
      const id = String(t._id);
      const inQty   = purchasedMap[id]?.received || 0;
      const outQty  = soldMap[id]?.qty || 0;
      const dispensed = dispensedMap[id]?.dispensed || 0;
      const variance = dipMap[id]?.variance || 0;
      return {
        _id: t._id, name: t.name, fuelType: t.fuelType,
        capacity: t.capacity, currentStock: t.currentStock, minLevel: t.minLevel,
        fillPct: t.capacity > 0 ? Math.round((t.currentStock / t.capacity) * 100) : 0,
        valuation: (t.currentStock || 0) * (t.fuelType?.currentRate || 0),
        period: { in: inQty, sold: outQty, dispensed, variance },
        belowMin: (t.currentStock || 0) < (t.minLevel || 0),
      };
    });

    const summary = data.reduce((a, t) => {
      a.totalCapacity += t.capacity || 0;
      a.totalStock    += t.currentStock || 0;
      a.totalValue    += t.valuation || 0;
      if (t.belowMin) a.belowMinCount++;
      return a;
    }, { totalCapacity: 0, totalStock: 0, totalValue: 0, belowMinCount: 0 });

    res.json({ success: true, data: { tanks: data, summary } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 6. Credit Aging Report ──────────────────────────────────────
exports.creditAging = async (req, res) => {
  try {
    const tq = tQuery(req);
    const customers = await Customer.find({ ...tq, balance: { $gt: 0 } }).lean();
    const now = new Date();
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
    const rows = [];
    for (const c of customers) {
      const oldest = await Sale.findOne({ ...tq, customer: c._id, saleType: 'credit' }).sort({ date: 1 }).lean();
      const days = oldest ? Math.floor((now - new Date(oldest.date)) / 86400000) : 0;
      let bucket = 'current';
      if (days > 90) bucket = 'd90plus';
      else if (days > 60) bucket = 'd90';
      else if (days > 30) bucket = 'd60';
      else if (days > 0)  bucket = 'd30';
      buckets[bucket] += c.balance;
      rows.push({
        _id: c._id, name: c.name, type: c.type, phone: c.phone,
        creditLimit: c.creditLimit, balance: c.balance,
        utilization: c.creditLimit > 0 ? Math.round((c.balance / c.creditLimit) * 100) : 0,
        oldestDays: days, bucket,
        overLimit: c.creditLimit > 0 && c.balance > c.creditLimit,
      });
    }
    rows.sort((a, b) => b.balance - a.balance);
    res.json({ success: true, data: { rows, buckets, total: rows.reduce((a, r) => a + r.balance, 0) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 7. Customer Statement ───────────────────────────────────────
exports.customerStatement = async (req, res) => {
  try {
    const tq = tQuery(req);
    const customer = await Customer.findOne({ ...tq, _id: req.params.id }).lean();
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const range = dateRange(req.query);
    const customerFilter = (extra = {}) => ({ ...tq, customer: customer._id, ...range, ...extra });

    const sales = await Sale.find(customerFilter({ saleType: 'credit' }))
      .populate('fuelType', 'name unit').sort({ date: 1 }).lean();
    const payments = await CreditPayment.find(customerFilter()).sort({ date: 1 }).lean();

    const entries = [
      ...sales.map(s => ({ kind: 'Sale', date: s.date, debit: s.amount, credit: 0,
        ref: s.invoiceNumber || s.vehicleNumber || '',
        desc: `${s.fuelType?.name || 'Fuel'} ${s.quantity} ${s.fuelType?.unit || 'L'} @ ${s.rate}` })),
      ...payments.map(p => ({ kind: 'Payment', date: p.date, debit: 0, credit: p.amount,
        ref: p.reference || '', desc: `${p.method} payment` })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    entries.forEach(e => { balance += e.debit - e.credit; e.balance = balance; });

    const totals = {
      debit: entries.reduce((a, e) => a + e.debit, 0),
      credit: entries.reduce((a, e) => a + e.credit, 0),
      closing: balance,
    };
    res.json({ success: true, data: { customer, entries: entries.reverse(), totals } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 8. Supplier Statement ───────────────────────────────────────
exports.supplierStatement = async (req, res) => {
  try {
    const tq = tQuery(req);
    const supplier = await Supplier.findOne({ ...tq, _id: req.params.id }).lean();
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const range = dateRange(req.query);
    const purchases = await Purchase.find({ ...tq, supplier: supplier._id, ...range })
      .populate('fuelType', 'name unit').sort({ date: 1 }).lean();
    const payments = await SupplierPayment.find({ ...tq, supplier: supplier._id, ...range }).sort({ date: 1 }).lean();

    const entries = [
      ...purchases.map(p => ({ kind: 'Purchase', date: p.date, debit: 0, credit: p.amount,
        ref: p.invoiceNumber || p.tankerNumber || '',
        desc: `${p.fuelType?.name || p.productName || ''} ${p.quantity} ${p.fuelType?.unit || 'L'} @ ${p.rate}` })),
      ...payments.map(pay => ({ kind: 'Payment', date: pay.date, debit: pay.amount, credit: 0,
        ref: pay.reference || '', desc: `${pay.method} payment` })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    entries.forEach(e => { balance += e.credit - e.debit; e.balance = balance; });

    const totals = {
      credit: entries.reduce((a, e) => a + e.credit, 0),
      debit: entries.reduce((a, e) => a + e.debit, 0),
      closing: balance,
    };
    res.json({ success: true, data: { supplier, entries: entries.reverse(), totals } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 9. Tank Variance Report ────────────────────────────────────
exports.varianceReport = async (req, res) => {
  try {
    const tq = tQuery(req);
    const match = { ...tq, ...dateRange(req.query) };
    const dips = await Dip.find(match).populate('tank', 'name').populate('fuelType', 'name unit').sort({ date: -1 }).lean();

    const byTank = {};
    dips.forEach(d => {
      const key = d.tank?.name || '—';
      if (!byTank[key]) byTank[key] = { name: key, fuel: d.fuelType?.name, count: 0, totalVariance: 0, gain: 0, loss: 0 };
      byTank[key].count++;
      byTank[key].totalVariance += d.variance || 0;
      if (d.variance > 0) byTank[key].gain += d.variance;
      else                byTank[key].loss += d.variance;
    });

    const totals = dips.reduce((a, d) => {
      a.count++;
      a.totalVariance += d.variance || 0;
      if (d.variance > 0) a.gain += d.variance;
      else                a.loss += d.variance;
      return a;
    }, { count: 0, totalVariance: 0, gain: 0, loss: 0 });

    res.json({ success: true, data: { dips, byTank: Object.values(byTank), totals } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 10. Expense Report ──────────────────────────────────────────
exports.expenseReport = async (req, res) => {
  try {
    const match = { ...tFilter(req), ...dateRange(req.query) };
    const tq = tQuery(req);

    const [byCategory, byMethod, daily, totals, recent] = await Promise.all([
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { amount: -1 } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, amount: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.find({ ...tq, ...dateRange(req.query) }).sort({ date: -1 }).limit(50).lean(),
    ]);

    res.json({ success: true, data: {
      totals: totals[0] || { amount: 0, count: 0 },
      byCategory, byMethod, daily, recent,
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 11. Profitability by Fuel ───────────────────────────────────
exports.fuelProfitability = async (req, res) => {
  try {
    const match = { ...tFilter(req), ...dateRange(req.query) };

    const sales = await Sale.aggregate([
      { $match: match },
      { $group: { _id: '$fuelType', qty: { $sum: '$quantity' }, revenue: { $sum: '$amount' } } },
      { $lookup: { from: 'fueltypes', localField: '_id', foreignField: '_id', as: 'f' } },
      { $unwind: { path: '$f', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$f.name', color: '$f.color', unit: '$f.unit', qty: 1, revenue: 1 } },
    ]);
    const purchases = await Purchase.aggregate([
      { $match: match },
      { $group: { _id: '$fuelType', qty: { $sum: '$receivedQuantity' }, cost: { $sum: '$amount' } } },
    ]);
    const purchaseMap = Object.fromEntries(purchases.map(p => [String(p._id), p]));

    const rows = sales.map(s => {
      const p = purchaseMap[String(s._id)] || { qty: 0, cost: 0 };
      const avgCost = p.qty > 0 ? p.cost / p.qty : 0;
      const cogs = avgCost * s.qty;
      const profit = s.revenue - cogs;
      return {
        name: s.name, color: s.color, unit: s.unit,
        soldQty: s.qty, revenue: s.revenue,
        purchasedQty: p.qty, purchasedCost: p.cost,
        avgCost, cogs, profit,
        margin: s.revenue > 0 ? +((profit / s.revenue) * 100).toFixed(2) : 0,
      };
    });

    const totals = rows.reduce((a, r) => {
      a.revenue += r.revenue; a.cogs += r.cogs; a.profit += r.profit;
      return a;
    }, { revenue: 0, cogs: 0, profit: 0 });
    totals.margin = totals.revenue > 0 ? +((totals.profit / totals.revenue) * 100).toFixed(2) : 0;

    res.json({ success: true, data: { rows, totals } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── 12. Monthly Trend ───────────────────────────────────────────
exports.monthlyTrend = async (req, res) => {
  try {
    const tf = tFilter(req);
    const months = parseInt(req.query.months) || 12;
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1); start.setHours(0,0,0,0);

    const grp = (Model) => Model.aggregate([
      { $match: { ...tf, date: { $gte: start } } },
      { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, amount: { $sum: '$amount' } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);
    const [s, p, e] = await Promise.all([grp(Sale), grp(Purchase), grp(Expense)]);

    const key = (y, m) => `${y}-${String(m).padStart(2,'0')}`;
    const out = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(start); d.setMonth(d.getMonth() + i);
      const k = key(d.getFullYear(), d.getMonth() + 1);
      const find = (arr) => arr.find(x => key(x._id.y, x._id.m) === k)?.amount || 0;
      const sales = find(s), purchases = find(p), expenses = find(e);
      out.push({ month: k, label: d.toLocaleDateString('en-PK',{month:'short',year:'2-digit'}),
        sales, purchases, expenses, profit: sales - purchases - expenses });
    }
    res.json({ success: true, data: out });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
