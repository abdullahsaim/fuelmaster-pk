const Tenant = require('../models/Tenant');

/**
 * Tenant Scoping Middleware
 *
 * After `protect` runs, this middleware:
 * 1. Reads tenant ID from the JWT (set during login)
 * 2. Loads the tenant document
 * 3. Checks subscription validity
 * 4. Sets req.tenantId for query scoping
 * 5. Sets req.tenant for feature/limit checks
 *
 * Superadmin bypasses tenant scoping entirely.
 */
const tenantScope = async (req, res, next) => {
  try {
    // Superadmin can access everything — no tenant scoping
    if (req.user.role === 'superadmin') {
      req.tenantId = req.query._tenant || null; // Optional: admin can impersonate
      if (req.tenantId) {
        req.tenant = await Tenant.findById(req.tenantId);
      }
      return next();
    }

    const tenantId = req.user.tenant;
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'No station assigned to your account. Contact support.' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(403).json({ success: false, message: 'Station not found. Contact support.' });
    }

    if (!tenant.isActive) {
      return res.status(403).json({ success: false, message: 'Your station account has been deactivated. Contact support.' });
    }

    // Check subscription validity
    if (!tenant.isSubscriptionValid()) {
      return res.status(402).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
      });
    }

    req.tenantId = tenantId;
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Feature Gate Middleware Factory
 *
 * Usage: featureGate('payroll')  — blocks if tenant's plan doesn't include 'payroll'
 * Usage: featureGate('report_fuelProfit') — blocks specific reports
 */
const featureGate = (featureKey) => {
  return (req, res, next) => {
    // Superadmin bypasses
    if (req.user.role === 'superadmin') return next();

    if (!req.tenant) {
      return res.status(403).json({ success: false, message: 'Tenant context required' });
    }

    if (!req.tenant.hasFeature(featureKey)) {
      const { PACKAGES } = require('../models/Tenant');
      const currentPlan = PACKAGES[req.tenant.plan];

      // Find the cheapest plan that includes this feature
      const upgradeTo = Object.entries(PACKAGES).find(([key, pkg]) => {
        return pkg.features.includes('*') || pkg.features.includes(featureKey);
      });

      return res.status(403).json({
        success: false,
        message: `This feature requires a higher plan.`,
        code: 'FEATURE_LOCKED',
        feature: featureKey,
        currentPlan: req.tenant.plan,
        upgradeTo: upgradeTo ? upgradeTo[0] : 'enterprise',
      });
    }

    next();
  };
};

/**
 * Limit Check Middleware Factory
 *
 * Usage: limitCheck('Tank', 'maxTanks')
 * Checks if tenant has reached the limit for a resource before creating
 */
const limitCheck = (Model, limitKey) => {
  return async (req, res, next) => {
    if (req.user.role === 'superadmin') return next();
    if (!req.tenant) return res.status(403).json({ success: false, message: 'Tenant context required' });

    try {
      const limits = req.tenant.getPlanLimits();
      const max = limits[limitKey];
      if (!max) return next(); // No limit defined

      const currentCount = await Model.countDocuments({ tenant: req.tenantId });
      if (currentCount >= max) {
        return res.status(403).json({
          success: false,
          message: `You've reached the ${limitKey.replace('max', '').toLowerCase()} limit (${max}) for your ${req.tenant.plan} plan. Upgrade for more.`,
          code: 'LIMIT_REACHED',
          limit: max,
          current: currentCount,
          currentPlan: req.tenant.plan,
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = { tenantScope, featureGate, limitCheck };
