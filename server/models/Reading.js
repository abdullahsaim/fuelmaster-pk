const mongoose = require('mongoose');

// Per-shift nozzle meter reading. Each reading record represents a closed
// shift for a single nozzle and is the source of truth for sales reconciliation.
const ReadingSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date:        { type: Date,   required: true, default: Date.now },
  shift:       { type: String, enum: ['day', 'night'], required: true },
  pump:        { type: mongoose.Schema.Types.ObjectId, ref: 'Pump' },
  nozzle:      { type: mongoose.Schema.Types.ObjectId, ref: 'Nozzle', required: true },
  fuelType:    { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
  tank:        { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  opening:     { type: Number, required: true },                   // Meter opening
  closing:     { type: Number, required: true },                   // Meter closing
  testing:     { type: Number, default: 0 },                       // Litres used for test/calibration
  dispensed:   { type: Number },                                   // closing - opening - testing
  rate:        { type: Number, required: true },                   // Selling rate at shift
  amount:      { type: Number },                                   // dispensed * rate
  cashDeclared:{ type: Number, default: 0 },                       // Cash declared by operator
  shortExcess: { type: Number, default: 0 },                       // declared - amount
  operator:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  recordedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:       { type: String },
}, { timestamps: true });

ReadingSchema.pre('save', function(next) {
  this.dispensed = Math.max(0, (this.closing || 0) - (this.opening || 0) - (this.testing || 0));
  this.amount    = this.dispensed * (this.rate || 0);
  this.shortExcess = (this.cashDeclared || 0) - this.amount;
  next();
});

ReadingSchema.index({ date: -1, shift: 1 });
ReadingSchema.index({ nozzle: 1, date: -1 });

module.exports = mongoose.model('Reading', ReadingSchema);
