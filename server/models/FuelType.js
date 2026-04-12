const mongoose = require('mongoose');

const FuelTypeSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, trim: true },       // e.g. "Petrol (RON 92)"
  code: { type: String, required: true, unique: true },      // e.g. "petrol", "diesel", "hobc", "cng"
  currentRate: { type: Number, required: true },              // OGRA notified rate per unit
  unit: { type: String, default: 'Ltr', enum: ['Ltr', 'Kg'] },
  color: { type: String, default: '#22c55e' },               // For UI display
  isActive: { type: Boolean, default: true },
  rateHistory: [{
    rate: Number,
    effectiveFrom: Date,
    effectiveTo: Date,
    ograNotification: String,                                 // OGRA notification reference
  }],
}, { timestamps: true });

module.exports = mongoose.model('FuelType', FuelTypeSchema);
