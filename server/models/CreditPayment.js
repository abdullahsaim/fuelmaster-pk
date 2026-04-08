const mongoose = require('mongoose');

// A payment received from a credit customer to settle outstanding balance.
const CreditPaymentSchema = new mongoose.Schema({
  date:          { type: Date, required: true, default: Date.now },
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount:        { type: Number, required: true },
  method:        { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online', 'Adjustment'], default: 'Cash' },
  reference:     { type: String, trim: true },                  // Cheque #, transaction id
  bank:          { type: String, trim: true },
  receivedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:         { type: String },
}, { timestamps: true });

CreditPaymentSchema.index({ date: -1 });
CreditPaymentSchema.index({ customer: 1, date: -1 });

module.exports = mongoose.model('CreditPayment', CreditPaymentSchema);
