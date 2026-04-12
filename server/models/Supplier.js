const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Fuel', 'Lubricant', 'Parts', 'Other'], default: 'Fuel' },
  city: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  ntn: { type: String, trim: true },                          // National Tax Number
  strn: { type: String, trim: true },                         // Sales Tax Registration
  contactPerson: { type: String, trim: true },
  balance: { type: Number, default: 0 },                      // Amount payable
  isActive: { type: Boolean, default: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
