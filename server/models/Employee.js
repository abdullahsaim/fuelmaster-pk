const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, trim: true },
  cnic: { type: String, required: true, unique: true, trim: true },   // 35202-1234567-1
  fatherName: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  role: { type: String, enum: ['Manager', 'Cashier', 'Pump Operator', 'Guard', 'Helper', 'Accountant', 'Other'], required: true },
  shift: { type: String, enum: ['Day', 'Night', 'Rotating'], default: 'Day' },
  salary: { type: Number, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive', 'Terminated', 'On Leave'], default: 'Active' },
  bankAccount: { type: String, trim: true },
  bankName: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },
  photo: { type: String },                                     // File path
  documents: [{ name: String, path: String }],
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
