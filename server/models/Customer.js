const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Cash', 'Fleet', 'Corporate', 'Government', 'Individual'], default: 'Cash' },
  city: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  cnic: { type: String, trim: true },
  ntn: { type: String, trim: true },
  creditLimit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },                      // Outstanding credit amount
  vehicles: [{
    number: String,                                            // e.g. "LHR-4521"
    type: String,                                              // Car, Truck, Bus, Motorcycle
    driver: String,
  }],
  totalVehicles: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
}, { timestamps: true });

// Virtual: credit utilization %
CustomerSchema.virtual('utilization').get(function() {
  return this.creditLimit > 0 ? Math.round((this.balance / this.creditLimit) * 100) : 0;
});

CustomerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', CustomerSchema);
