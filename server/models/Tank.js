const mongoose = require('mongoose');

const TankSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },        // e.g. "Tank A (Petrol)"
  fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
  capacity: { type: Number, required: true },                 // Max capacity in Ltrs/Kg
  currentStock: { type: Number, default: 0 },                 // Current fuel level
  minLevel: { type: Number, default: 1000 },                  // Alert threshold
  isActive: { type: Boolean, default: true },
  dipReadings: [{
    date: { type: Date, default: Date.now },
    physicalStock: Number,                                     // Actual measured stock (dip reading)
    bookStock: Number,                                         // Calculated book stock
    gainLoss: Number,                                          // Difference (+ gain, - loss)
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Tank', TankSchema);
