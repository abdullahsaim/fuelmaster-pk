const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  category: {
    type: String,
    required: true,
    enum: [
      'Electricity', 'Sui Gas', 'Water', 'Rent', 'Maintenance',
      'Salary Advance', 'Transport', 'Office', 'Tax', 'Insurance',
      'Fuel (Own Use)', 'Legal', 'Marketing', 'Miscellaneous',
      'Equipment', 'Security', 'Cleaning', 'Communication',
    ],
  },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'], default: 'Cash' },
  reference: { type: String, trim: true },                     // Bill/receipt number
  paidTo: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receipt: { type: String },                                    // Uploaded receipt image path
  notes: { type: String },
}, { timestamps: true });

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
