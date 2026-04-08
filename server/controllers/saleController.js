const Sale = require('../models/Sale');
const Tank = require('../models/Tank');
const Customer = require('../models/Customer');
const StockMovement = require('../models/StockMovement');

// @desc    Get all sales with filters
// @route   GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const { fuelType, saleType, startDate, endDate, customer, shift, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (fuelType) filter.fuelType = fuelType;
    if (saleType) filter.saleType = saleType;
    if (customer) filter.customer = customer;
    if (shift) filter.shift = shift;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const total = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate('fuelType', 'name code color unit')
      .populate('customer', 'name type')
      .populate('nozzle', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, count: sales.length, total, page: parseInt(page), pages: Math.ceil(total / limit), data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create sale
// @route   POST /api/sales
exports.createSale = async (req, res) => {
  try {
    const { fuelType, tank, quantity, rate, saleType, customer, vehicleNumber, nozzle, shift, notes } = req.body;
    const amount = quantity * rate;
    const sale = await Sale.create({
      date: new Date(), fuelType, tank, nozzle, quantity, rate, amount,
      saleType, customer, vehicleNumber, shift, receivedBy: req.user._id, notes,
    });
    // Decrease tank stock + log movement
    if (tank) {
      const t = await Tank.findByIdAndUpdate(tank, { $inc: { currentStock: -quantity } }, { new: true });
      await StockMovement.create({
        date: sale.date, tank, fuelType, type: 'OUT', quantity, source: 'sale',
        reference: sale._id, refModel: 'Sale', balanceAfter: t?.currentStock,
        createdBy: req.user._id, notes: `Sale ${saleType}`,
      });
    }
    // Increase customer balance for credit sales
    if (saleType === 'credit' && customer) {
      await Customer.findByIdAndUpdate(customer, { $inc: { balance: amount } });
    }
    const populated = await Sale.findById(sale._id)
      .populate('fuelType', 'name code color unit')
      .populate('customer', 'name type');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('fuelType').populate('customer').populate('nozzle').populate('tank');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete sale (owner/manager only)
// @route   DELETE /api/sales/:id
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    // Reverse stock and balance changes
    if (sale.tank) await Tank.findByIdAndUpdate(sale.tank, { $inc: { currentStock: sale.quantity } });
    if (sale.saleType === 'credit' && sale.customer) {
      await Customer.findByIdAndUpdate(sale.customer, { $inc: { balance: -sale.amount } });
    }
    await StockMovement.deleteMany({ reference: sale._id, refModel: 'Sale' });
    await sale.deleteOne();
    res.json({ success: true, message: 'Sale deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sales summary/aggregation
// @route   GET /api/sales/summary
exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate + 'T23:59:59');
    }
    // Total by fuel type
    const byFuel = await Sale.aggregate([
      { $match: match },
      { $group: { _id: '$fuelType', totalQty: { $sum: '$quantity' }, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'fueltypes', localField: '_id', foreignField: '_id', as: 'fuel' } },
      { $unwind: '$fuel' },
      { $project: { fuelName: '$fuel.name', fuelCode: '$fuel.code', color: '$fuel.color', totalQty: 1, totalAmount: 1, count: 1 } },
    ]);
    // Cash vs Credit
    const bySaleType = await Sale.aggregate([
      { $match: match },
      { $group: { _id: '$saleType', totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
    ]);
    // Daily totals (last 30 days)
    const daily = await Sale.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' } } },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);
    const grandTotal = await Sale.aggregate([
      { $match: match },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { byFuel, bySaleType, daily, totals: grandTotal[0] || { totalAmount: 0, totalQty: 0, count: 0 } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
