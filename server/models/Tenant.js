const mongoose = require('mongoose');

// ─── PACKAGE DEFINITIONS ───
// Centralized plan configuration — used by feature gate middleware
const PACKAGES = {
  free: {
    name: 'Free',
    price: 0,
    maxUsers: 2,
    maxTanks: 2,
    maxNozzles: 4,
    maxPumps: 2,
    maxCustomers: 10,
    maxSuppliers: 5,
    maxEmployees: 5,
    features: [
      'dashboard', 'sales', 'purchases', 'stock', 'pumps',
      'customers', 'suppliers', 'fuel_types', 'settings',
    ],
    reports: ['pnl', 'sales', 'day'],
    description: 'For small stations getting started',
  },
  starter: {
    name: 'Starter',
    price: 2999,  // PKR/month
    maxUsers: 5,
    maxTanks: 4,
    maxNozzles: 8,
    maxPumps: 4,
    maxCustomers: 50,
    maxSuppliers: 20,
    maxEmployees: 15,
    features: [
      'dashboard', 'sales', 'purchases', 'stock', 'pumps',
      'customers', 'suppliers', 'employees', 'expenses',
      'readings', 'dips', 'credit', 'fuel_types', 'settings',
      'history', 'quick_sale',
    ],
    reports: ['pnl', 'sales', 'purchases', 'day', 'shift', 'stock', 'expenses'],
    description: 'For growing stations with basic team',
  },
  professional: {
    name: 'Professional',
    price: 5999,  // PKR/month
    maxUsers: 15,
    maxTanks: 10,
    maxNozzles: 20,
    maxPumps: 10,
    maxCustomers: 500,
    maxSuppliers: 100,
    maxEmployees: 50,
    features: [
      'dashboard', 'sales', 'purchases', 'stock', 'pumps',
      'customers', 'suppliers', 'employees', 'expenses',
      'readings', 'dips', 'credit', 'supplier_payments',
      'payroll', 'cash_closing', 'fuel_types', 'settings',
      'history', 'reports', 'quick_sale', 'shift_handover',
      'attendance', 'tank_transfer', 'checklist',
    ],
    reports: ['pnl', 'sales', 'purchases', 'day', 'shift', 'stock', 'expenses', 'fuelProfit', 'creditAging', 'variance', 'monthly'],
    description: 'Full features for professional stations',
  },
  enterprise: {
    name: 'Enterprise',
    price: 9999,  // PKR/month
    maxUsers: 999,
    maxTanks: 999,
    maxNozzles: 999,
    maxPumps: 999,
    maxCustomers: 99999,
    maxSuppliers: 99999,
    maxEmployees: 999,
    features: ['*'],  // All features
    reports: ['*'],   // All reports
    description: 'Unlimited — for chains and multi-site operators',
  },
};

const TenantSchema = new mongoose.Schema({
  // Station identity
  name: { type: String, required: true, trim: true },           // "Al-Madina Filling Station"
  slug: { type: String, unique: true, lowercase: true },        // "al-madina-filling-station"
  brand: { type: String, default: 'Other' },
  city: { type: String, trim: true },
  province: { type: String },
  phone: { type: String },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String },
  logo: { type: String },

  // Owner reference
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Subscription
  plan: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'], default: 'trial' },
  trialEndsAt: { type: Date },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },

  // Usage tracking
  currentUsers: { type: Number, default: 1 },
  currentTanks: { type: Number, default: 0 },
  currentNozzles: { type: Number, default: 0 },
  currentPumps: { type: Number, default: 0 },

  // Feature overrides (admin can grant/revoke specific features)
  featureOverrides: {
    granted: [{ type: String }],    // Extra features beyond plan
    revoked: [{ type: String }],    // Features removed from plan
  },

  // Payment history
  payments: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number },
    method: { type: String },
    reference: { type: String },
    plan: { type: String },
    period: { type: String },       // "2026-04" or "2026-04 to 2027-03"
    notes: { type: String },
  }],

  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

// Auto-generate slug
TenantSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }
  next();
});

// Check if tenant has access to a feature
TenantSchema.methods.hasFeature = function(featureKey) {
  // Check revoked first
  if (this.featureOverrides?.revoked?.includes(featureKey)) return false;
  // Check granted overrides
  if (this.featureOverrides?.granted?.includes(featureKey)) return true;
  // Check plan
  const pkg = PACKAGES[this.plan] || PACKAGES.free;
  return pkg.features.includes('*') || pkg.features.includes(featureKey);
};

// Check if tenant has access to a report
TenantSchema.methods.hasReport = function(reportKey) {
  if (this.featureOverrides?.revoked?.includes(`report_${reportKey}`)) return false;
  if (this.featureOverrides?.granted?.includes(`report_${reportKey}`)) return true;
  const pkg = PACKAGES[this.plan] || PACKAGES.free;
  return pkg.reports.includes('*') || pkg.reports.includes(reportKey);
};

// Get plan limits
TenantSchema.methods.getPlanLimits = function() {
  return PACKAGES[this.plan] || PACKAGES.free;
};

// Check if subscription is valid
TenantSchema.methods.isSubscriptionValid = function() {
  if (this.isDemo) return true;
  if (this.subscriptionStatus === 'active') return true;
  if (this.subscriptionStatus === 'trial' && this.trialEndsAt > new Date()) return true;
  // 7-day grace period for past_due
  if (this.subscriptionStatus === 'past_due' && this.subscriptionEndDate) {
    const grace = new Date(this.subscriptionEndDate);
    grace.setDate(grace.getDate() + 7);
    return grace > new Date();
  }
  return false;
};

TenantSchema.index({ slug: 1 });
TenantSchema.index({ owner: 1 });
TenantSchema.index({ plan: 1 });

module.exports = mongoose.model('Tenant', TenantSchema);
module.exports.PACKAGES = PACKAGES;
