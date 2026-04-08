const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Reading = require('../models/Reading');
const Dip = require('../models/Dip');
const StockMovement = require('../models/StockMovement');
const CreditPayment = require('../models/CreditPayment');
const SupplierPayment = require('../models/SupplierPayment');

// Unified history feed of all major operations.
exports.feed = async (req, res) => {
  try {
    const { startDate, endDate, types, limit = 100 } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate)   dateFilter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const wanted = types ? types.split(',') : ['sale','purchase','reading','dip','credit','payable'];
    const lim = parseInt(limit);
    const tasks = [];

    if (wanted.includes('sale'))
      tasks.push(Sale.find(dateFilter).populate('fuelType', 'name unit').populate('customer', 'name')
        .sort({ date: -1 }).limit(lim).lean().then(rows => rows.map(r => ({
          kind: 'Sale', date: r.date, amount: r.amount,
          desc: `${r.quantity} ${r.fuelType?.unit || 'L'} ${r.fuelType?.name || ''} ${r.saleType === 'credit' ? '(credit)' : ''}`,
          who: r.customer?.name || (r.saleType === 'cash' ? 'Cash sale' : ''), color: '#10b981', _id: r._id,
        }))));
    if (wanted.includes('purchase'))
      tasks.push(Purchase.find(dateFilter).populate('supplier', 'name').populate('fuelType', 'name unit')
        .sort({ date: -1 }).limit(lim).lean().then(rows => rows.map(r => ({
          kind: 'Purchase', date: r.date, amount: r.amount,
          desc: `${r.quantity} ${r.fuelType?.unit || 'L'} ${r.fuelType?.name || r.productName || ''}`,
          who: r.supplier?.name || '', color: '#3b82f6', _id: r._id,
        }))));
    if (wanted.includes('reading'))
      tasks.push(Reading.find(dateFilter).populate('nozzle', 'name').populate('fuelType', 'name unit')
        .sort({ date: -1 }).limit(lim).lean().then(rows => rows.map(r => ({
          kind: 'Reading', date: r.date, amount: r.amount,
          desc: `${r.nozzle?.name || ''} ${r.shift} shift ${r.dispensed} ${r.fuelType?.unit || 'L'}`,
          who: '', color: '#8b5cf6', _id: r._id,
        }))));
    if (wanted.includes('dip'))
      tasks.push(Dip.find(dateFilter).populate('tank', 'name').sort({ date: -1 }).limit(lim).lean()
        .then(rows => rows.map(r => ({
          kind: 'Dip', date: r.date, amount: r.variance,
          desc: `${r.tank?.name || ''} physical ${r.physicalStock} vs book ${r.bookStock} (${r.variance >= 0 ? '+' : ''}${r.variance})`,
          who: '', color: r.variance < 0 ? '#ef4444' : '#06b6d4', _id: r._id,
        }))));
    if (wanted.includes('credit'))
      tasks.push(CreditPayment.find(dateFilter).populate('customer', 'name').sort({ date: -1 }).limit(lim).lean()
        .then(rows => rows.map(r => ({
          kind: 'Credit Payment', date: r.date, amount: r.amount,
          desc: `${r.method} from ${r.customer?.name || ''}`, who: r.customer?.name || '', color: '#f59e0b', _id: r._id,
        }))));
    if (wanted.includes('payable'))
      tasks.push(SupplierPayment.find(dateFilter).populate('supplier', 'name').sort({ date: -1 }).limit(lim).lean()
        .then(rows => rows.map(r => ({
          kind: 'Supplier Payment', date: r.date, amount: r.amount,
          desc: `${r.method} to ${r.supplier?.name || ''}`, who: r.supplier?.name || '', color: '#ec4899', _id: r._id,
        }))));

    const all = (await Promise.all(tasks)).flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, lim);

    res.json({ success: true, count: all.length, data: all });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.stockMovements = async (req, res) => {
  try {
    const { tank, startDate, endDate, limit = 200 } = req.query;
    const filter = {};
    if (tank) filter.tank = tank;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const data = await StockMovement.find(filter)
      .populate('tank', 'name').populate('fuelType', 'name unit')
      .sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
