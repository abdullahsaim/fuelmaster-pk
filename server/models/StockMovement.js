const mongoose = require('mongoose');

// Append-only ledger of all changes that affect tank/product stock.
// Sources: 'purchase', 'sale', 'reading', 'dip-adjustment', 'transfer', 'manual'
const StockMovementSchema = new mongoose.Schema({
  date:       { type: Date, required: true, default: Date.now },
  tank:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  fuelType:   { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType' },
  type:       { type: String, enum: ['IN', 'OUT', 'ADJUST'], required: true },
  quantity:   { type: Number, required: true },                // Always positive; type controls direction
  source:     { type: String, enum: ['purchase', 'sale', 'reading', 'dip', 'transfer', 'manual', 'opening'], required: true },
  reference:  { type: mongoose.Schema.Types.ObjectId },        // FK to source doc
  refModel:   { type: String },                                 // Source model name
  balanceAfter:{ type: Number },                                // Tank stock after movement (snapshot)
  notes:      { type: String },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

StockMovementSchema.index({ date: -1 });
StockMovementSchema.index({ tank: 1, date: -1 });
StockMovementSchema.index({ product: 1, date: -1 });

module.exports = mongoose.model('StockMovement', StockMovementSchema);
