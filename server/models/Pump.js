const mongoose = require('mongoose');

const PumpSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, trim: true },          // e.g. "Pump 1", "MPD-A"
  code: { type: String, trim: true },                           // Internal code
  location: { type: String, trim: true },                       // e.g. "Forecourt North"
  nozzles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nozzle' }],
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Pump', PumpSchema);
