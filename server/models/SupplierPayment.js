const mongoose = require('mongoose');

// A payment made to a fuel/lubricant supplier to settle payable balance.
const SupplierPaymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date:        { type: Date, required: true, default: Date.now },
  supplier:    { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  amount:      { type: Number, required: true },
  method:      { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online', 'Adjustment'], default: 'Bank Transfer' },
  reference:   { type: String, trim: true },
  bank:        { type: String, trim: true },
  paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:       { type: String },
}, { timestamps: true });

SupplierPaymentSchema.index({ date: -1 });
SupplierPaymentSchema.index({ supplier: 1, date: -1 });

module.exports = mongoose.model('SupplierPayment', SupplierPaymentSchema);
