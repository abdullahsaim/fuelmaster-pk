const mongoose = require('mongoose');

const NozzleSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, trim: true },         // e.g. "Nozzle 1-A"
  tank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank', required: true },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  meterReadings: [{
    date: { type: Date, default: Date.now },
    shift: { type: String, enum: ['day', 'night'] },
    opening: { type: Number, required: true },
    closing: { type: Number, required: true },
    totalDispensed: Number,                                    // closing - opening
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

// Calculate totalDispensed before save
NozzleSchema.pre('save', function(next) {
  if (this.meterReadings && this.meterReadings.length > 0) {
    const lastReading = this.meterReadings[this.meterReadings.length - 1];
    lastReading.totalDispensed = lastReading.closing - lastReading.opening;
  }
  next();
});

module.exports = mongoose.model('Nozzle', NozzleSchema);
