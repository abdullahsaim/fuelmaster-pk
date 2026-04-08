const mongoose = require('mongoose');

// Tank dipping (manual physical stock measurement) record.
// Compared against book stock to detect gain/loss/evaporation/leak.
const DipSchema = new mongoose.Schema({
  date:          { type: Date, required: true, default: Date.now },
  shift:         { type: String, enum: ['day', 'night', 'opening', 'closing'], default: 'opening' },
  tank:          { type: mongoose.Schema.Types.ObjectId, ref: 'Tank', required: true },
  fuelType:      { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType' },
  physicalStock: { type: Number, required: true },             // Measured by dip stick / ATG
  bookStock:     { type: Number, required: true },             // System balance at measurement time
  variance:      { type: Number },                              // physical - book (- = loss)
  temperature:   { type: Number },                              // °C, for VCF
  waterLevel:    { type: Number, default: 0 },                  // mm of water in tank
  adjustStock:   { type: Boolean, default: false },             // If true, adjust tank current stock to physical
  recordedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:         { type: String },
}, { timestamps: true });

DipSchema.pre('save', function(next) {
  this.variance = (this.physicalStock || 0) - (this.bookStock || 0);
  next();
});

DipSchema.index({ date: -1 });
DipSchema.index({ tank: 1, date: -1 });

module.exports = mongoose.model('Dip', DipSchema);
