const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  shift: { type: String, enum: ['day', 'night'], required: true },
  fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
  nozzle: { type: mongoose.Schema.Types.ObjectId, ref: 'Nozzle' },
  tank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  quantity: { type: Number, required: true },                  // Litres or Kg
  rate: { type: Number, required: true },                      // Rate per unit at time of sale
  amount: { type: Number, required: true },                    // quantity * rate
  saleType: { type: String, enum: ['cash', 'credit'], required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },  // For credit sales
  vehicleNumber: { type: String, trim: true },                 // For credit invoicing
  invoiceNumber: { type: String, trim: true },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

// Auto-calculate amount
SaleSchema.pre('save', function(next) {
  this.amount = this.quantity * this.rate;
  next();
});

// Indexes for fast queries
SaleSchema.index({ date: -1 });
SaleSchema.index({ fuelType: 1, date: -1 });
SaleSchema.index({ customer: 1, date: -1 });
SaleSchema.index({ saleType: 1 });

module.exports = mongoose.model('Sale', SaleSchema);
