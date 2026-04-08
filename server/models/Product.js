const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Engine Oil', 'Automotive', 'Motorcycle', 'Gear Oil', 'Coolant', 'Additive', 'Filter', 'Other'], required: true },
  brand: { type: String, trim: true },
  sku: { type: String, trim: true },
  purchaseRate: { type: Number, required: true },
  saleRate: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },                     // Reorder alert level
  unit: { type: String, default: 'pcs', enum: ['pcs', 'ltr', 'kg', 'box', 'pack'] },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.virtual('stockValue').get(function() {
  return this.stock * this.purchaseRate;
});

ProductSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
