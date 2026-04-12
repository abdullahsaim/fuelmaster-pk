const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date: { type: Date, required: true, default: Date.now },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType' },
  tank: { type: mongoose.Schema.Types.ObjectId, ref: 'Tank' },
  productName: { type: String, trim: true },                  // For non-fuel purchases
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  tankerNumber: { type: String, trim: true },                  // e.g. "LHR-4521"
  driverName: { type: String, trim: true },
  driverPhone: { type: String, trim: true },
  invoiceNumber: { type: String, trim: true },
  gatePassNumber: { type: String, trim: true },
  receivedQuantity: { type: Number },                          // Actual received (may differ from ordered)
  shortage: { type: Number, default: 0 },                     // Ordered - Received
  status: { type: String, enum: ['Pending', 'In Transit', 'Received', 'Disputed', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  paidAmount: { type: Number, default: 0 },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

PurchaseSchema.pre('save', function(next) {
  this.amount = this.quantity * this.rate;
  if (this.receivedQuantity != null) {
    this.shortage = this.quantity - this.receivedQuantity;
  }
  next();
});

PurchaseSchema.index({ date: -1 });
PurchaseSchema.index({ supplier: 1 });

module.exports = mongoose.model('Purchase', PurchaseSchema);
