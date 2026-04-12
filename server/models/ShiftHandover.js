const mongoose = require('mongoose');

const ShiftHandoverSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['day', 'night'], required: true },

  // People
  outgoingOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  incomingOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // Cash
  cashInHand: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalCashSales: { type: Number, default: 0 },
  totalCreditSales: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  shortExcess: { type: Number, default: 0 },

  // Meter readings snapshot
  meterReadings: [{
    nozzle: { type: mongoose.Schema.Types.ObjectId, ref: 'Nozzle' },
    nozzleName: String,
    closing: Number,
    dispensed: Number,
  }],

  // Tank levels at handover
  tankLevels: [{
    tank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
    tankName: String,
    level: Number,
  }],

  // Pending items for next shift
  pendingItems: [{ type: String }],
  remarks: { type: String },

  status: { type: String, enum: ['Draft', 'Submitted', 'Acknowledged'], default: 'Draft' },
  acknowledgedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ShiftHandoverSchema.index({ date: -1, shift: 1 });

module.exports = mongoose.model('ShiftHandover', ShiftHandoverSchema);
