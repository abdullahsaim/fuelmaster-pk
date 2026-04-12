const mongoose = require('mongoose');

const CashClosingSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['day', 'night', 'full'], default: 'full' },

  // Cash Inflows
  cashSales: { type: Number, default: 0 },
  creditCollected: { type: Number, default: 0 },
  otherIncome: { type: Number, default: 0 },
  totalCashIn: { type: Number, default: 0 },

  // Cash Outflows
  expenses: { type: Number, default: 0 },
  supplierPayments: { type: Number, default: 0 },
  salaryAdvances: { type: Number, default: 0 },
  otherPayments: { type: Number, default: 0 },
  totalCashOut: { type: Number, default: 0 },

  // Reconciliation
  expectedCash: { type: Number, default: 0 },
  actualCash: { type: Number, default: 0 },
  difference: { type: Number, default: 0 },

  // Denomination count (PKR notes)
  denominations: {
    n5000: { type: Number, default: 0 },
    n1000: { type: Number, default: 0 },
    n500:  { type: Number, default: 0 },
    n100:  { type: Number, default: 0 },
    n50:   { type: Number, default: 0 },
    n20:   { type: Number, default: 0 },
    n10:   { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
  },

  openingCash: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

CashClosingSchema.pre('save', function(next) {
  this.totalCashIn = this.cashSales + this.creditCollected + this.otherIncome;
  this.totalCashOut = this.expenses + this.supplierPayments + this.salaryAdvances + this.otherPayments;
  this.expectedCash = this.openingCash + this.totalCashIn - this.totalCashOut;
  this.difference = this.actualCash - this.expectedCash;
  next();
});

CashClosingSchema.index({ date: -1 });

module.exports = mongoose.model('CashClosing', CashClosingSchema);
