const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true },                     // "2026-04" format
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  overtime: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  loanDeduction: { type: Number, default: 0 },
  eobi: { type: Number, default: 0 },                         // EOBI contribution
  netSalary: { type: Number },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque'], default: 'Cash' },
  paymentDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Processed', 'Paid', 'Cancelled'], default: 'Pending' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendance: {
    totalDays: { type: Number, default: 30 },
    present: { type: Number, default: 30 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
  },
  notes: { type: String },
}, { timestamps: true });

// Auto-calculate net salary
PayrollSchema.pre('save', function(next) {
  this.netSalary = this.basicSalary + this.overtime + this.bonus
    - this.deductions - this.advance - this.loanDeduction - this.eobi;
  next();
});

PayrollSchema.index({ employee: 1, month: 1 });
PayrollSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Payroll', PayrollSchema);
