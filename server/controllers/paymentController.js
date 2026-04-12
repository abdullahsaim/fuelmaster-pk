const CreditPayment = require('../models/CreditPayment');
const SupplierPayment = require('../models/SupplierPayment');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// ─── Customer credit payments (money received) ───
exports.listCreditPayments = async (req, res) => {
  try {
    const { customer, startDate, endDate, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (req.tenantId) filter.tenant = req.tenantId;
    if (customer) filter.customer = customer;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const total = await CreditPayment.countDocuments(filter);
    const data = await CreditPayment.find(filter)
      .populate('customer', 'name type balance')
      .populate('receivedBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, count: data.length, total, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createCreditPayment = async (req, res) => {
  try {
    const payment = await CreditPayment.create({ ...req.body, tenant: req.tenantId, receivedBy: req.user._id });
    // Reduce customer outstanding balance
    await Customer.findByIdAndUpdate(payment.customer, { $inc: { balance: -payment.amount } });
    const populated = await CreditPayment.findById(payment._id).populate('customer', 'name type balance');
    res.status(201).json({ success: true, data: populated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteCreditPayment = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const payment = await CreditPayment.findOne(filter);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    await Customer.findByIdAndUpdate(payment.customer, { $inc: { balance: payment.amount } });
    await payment.deleteOne();
    res.json({ success: true, message: 'Payment removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Supplier payments (money paid out) ───
exports.listSupplierPayments = async (req, res) => {
  try {
    const { supplier, startDate, endDate, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (req.tenantId) filter.tenant = req.tenantId;
    if (supplier) filter.supplier = supplier;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const total = await SupplierPayment.countDocuments(filter);
    const data = await SupplierPayment.find(filter)
      .populate('supplier', 'name type balance')
      .populate('paidBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, count: data.length, total, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createSupplierPayment = async (req, res) => {
  try {
    const payment = await SupplierPayment.create({ ...req.body, tenant: req.tenantId, paidBy: req.user._id });
    await Supplier.findByIdAndUpdate(payment.supplier, { $inc: { balance: -payment.amount } });
    const populated = await SupplierPayment.findById(payment._id).populate('supplier', 'name type balance');
    res.status(201).json({ success: true, data: populated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteSupplierPayment = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const payment = await SupplierPayment.findOne(filter);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    await Supplier.findByIdAndUpdate(payment.supplier, { $inc: { balance: payment.amount } });
    await payment.deleteOne();
    res.json({ success: true, message: 'Payment removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// Customer ledger (sales + payments)
exports.customerLedger = async (req, res) => {
  try {
    const Sale = require('../models/Sale');
    const customerId = req.params.id;
    const customerFilter = { _id: customerId };
    if (req.tenantId) customerFilter.tenant = req.tenantId;
    const customer = await Customer.findOne(customerFilter);
    if (!customer) return res.status(404).json({ success: false, message: 'Not found' });

    const tenantMatch = req.tenantId ? { tenant: req.tenantId } : {};
    const sales = await Sale.find({ ...tenantMatch, customer: customerId, saleType: 'credit' })
      .populate('fuelType', 'name unit').sort({ date: -1 }).limit(200);
    const payments = await CreditPayment.find({ ...tenantMatch, customer: customerId }).sort({ date: -1 }).limit(200);

    const entries = [
      ...sales.map(s => ({ kind: 'sale', date: s.date, debit: s.amount, credit: 0,
        ref: s.invoiceNumber || s.vehicleNumber || '',
        desc: `${s.fuelType?.name || 'Fuel'} ${s.quantity} ${s.fuelType?.unit || 'L'} @ ${s.rate}` })),
      ...payments.map(p => ({ kind: 'payment', date: p.date, debit: 0, credit: p.amount,
        ref: p.reference || '', desc: `${p.method} payment` })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: { customer, entries } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
