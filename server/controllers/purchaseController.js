const Purchase = require('../models/Purchase');
const Tank = require('../models/Tank');
const Supplier = require('../models/Supplier');

exports.getPurchases = async (req, res) => {
  try {
    const { supplier, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const total = await Purchase.countDocuments(filter);
    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name type city')
      .populate('fuelType', 'name code color unit')
      .populate('tank', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, count: purchases.length, total, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const { supplier, fuelType, tank, quantity, rate, tankerNumber, driverName, driverPhone,
      invoiceNumber, gatePassNumber, receivedQuantity, status, notes } = req.body;
    const amount = quantity * rate;
    const purchase = await Purchase.create({
      date: new Date(), supplier, fuelType, tank, quantity, rate, amount,
      tankerNumber, driverName, driverPhone, invoiceNumber, gatePassNumber,
      receivedQuantity: receivedQuantity || quantity, status: status || 'Received',
      receivedBy: req.user._id, notes,
    });
    // Increase tank stock when received
    if (tank && (status === 'Received' || !status)) {
      await Tank.findByIdAndUpdate(tank, { $inc: { currentStock: receivedQuantity || quantity } });
    }
    // Increase supplier balance (amount owed)
    await Supplier.findByIdAndUpdate(supplier, { $inc: { balance: amount } });
    const populated = await Purchase.findById(purchase._id)
      .populate('supplier', 'name type').populate('fuelType', 'name code color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('supplier', 'name type').populate('fuelType', 'name code color');
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
    // Reverse stock and balance
    if (purchase.tank) await Tank.findByIdAndUpdate(purchase.tank, { $inc: { currentStock: -(purchase.receivedQuantity || purchase.quantity) } });
    await Supplier.findByIdAndUpdate(purchase.supplier, { $inc: { balance: -purchase.amount } });
    await purchase.deleteOne();
    res.json({ success: true, message: 'Purchase deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPurchaseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const bySupplier = await Purchase.aggregate([
      { $match: match },
      { $group: { _id: '$supplier', totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: '$supplier' },
      { $project: { supplierName: '$supplier.name', totalAmount: 1, totalQty: 1, count: 1 } },
    ]);
    const totals = await Purchase.aggregate([
      { $match: match },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { bySupplier, totals: totals[0] || {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
