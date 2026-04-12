const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { PACKAGES } = require('../models/Tenant');

// ─── SUPERADMIN: Tenant Management ───

// @desc    Get all tenants
// @route   GET /api/admin/tenants
exports.getAllTenants = async (req, res) => {
  try {
    const { plan, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (plan) filter.plan = plan;
    if (status) filter.subscriptionStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Tenant.countDocuments(filter);
    const tenants = await Tenant.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get user counts per tenant
    const tenantIds = tenants.map(t => t._id);
    const userCounts = await User.aggregate([
      { $match: { tenant: { $in: tenantIds } } },
      { $group: { _id: '$tenant', count: { $sum: 1 } } },
    ]);
    const userCountMap = Object.fromEntries(userCounts.map(u => [String(u._id), u.count]));

    const data = tenants.map(t => ({
      ...t.toObject(),
      userCount: userCountMap[String(t._id)] || 0,
      planDetails: PACKAGES[t.plan] || PACKAGES.free,
    }));

    // Summary stats
    const stats = {
      total,
      byPlan: {},
      byStatus: {},
      activeCount: await Tenant.countDocuments({ isActive: true }),
    };
    for (const pkg of Object.keys(PACKAGES)) {
      stats.byPlan[pkg] = await Tenant.countDocuments({ plan: pkg });
    }
    for (const s of ['trial', 'active', 'past_due', 'cancelled', 'expired']) {
      stats.byStatus[s] = await Tenant.countDocuments({ subscriptionStatus: s });
    }

    res.json({ success: true, total, page: parseInt(page), stats, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single tenant details
// @route   GET /api/admin/tenants/:id
exports.getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('owner', 'name email phone');
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const users = await User.find({ tenant: tenant._id }).select('name email role isActive lastLogin');
    const pkg = PACKAGES[tenant.plan] || PACKAGES.free;

    res.json({
      success: true,
      data: {
        ...tenant.toObject(),
        users,
        planDetails: pkg,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tenant (change plan, toggle active, feature overrides)
// @route   PUT /api/admin/tenants/:id
exports.updateTenant = async (req, res) => {
  try {
    const { plan, subscriptionStatus, isActive, featureOverrides, trialEndsAt,
      subscriptionStartDate, subscriptionEndDate, billingCycle, notes } = req.body;

    const update = {};
    if (plan !== undefined) update.plan = plan;
    if (subscriptionStatus !== undefined) update.subscriptionStatus = subscriptionStatus;
    if (isActive !== undefined) update.isActive = isActive;
    if (featureOverrides !== undefined) update.featureOverrides = featureOverrides;
    if (trialEndsAt !== undefined) update.trialEndsAt = trialEndsAt;
    if (subscriptionStartDate !== undefined) update.subscriptionStartDate = subscriptionStartDate;
    if (subscriptionEndDate !== undefined) update.subscriptionEndDate = subscriptionEndDate;
    if (billingCycle !== undefined) update.billingCycle = billingCycle;
    if (notes !== undefined) update.notes = notes;

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('owner', 'name email phone');
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record a payment for tenant
// @route   POST /api/admin/tenants/:id/payment
exports.recordPayment = async (req, res) => {
  try {
    const { amount, method, reference, plan, period, notes } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    tenant.payments.push({ amount, method, reference, plan: plan || tenant.plan, period, notes });

    // Auto-activate subscription on payment
    if (plan) tenant.plan = plan;
    tenant.subscriptionStatus = 'active';
    tenant.subscriptionStartDate = new Date();

    // Set end date based on billing cycle
    const endDate = new Date();
    if (tenant.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    tenant.subscriptionEndDate = endDate;

    await tenant.save();
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete tenant (and all associated users)
// @route   DELETE /api/admin/tenants/:id
exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    // Deactivate instead of hard delete (data safety)
    tenant.isActive = false;
    tenant.subscriptionStatus = 'cancelled';
    await tenant.save();

    // Deactivate all users
    await User.updateMany({ tenant: tenant._id }, { isActive: false });

    res.json({ success: true, message: `Tenant "${tenant.name}" deactivated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get packages/pricing info
// @route   GET /api/packages (public)
exports.getPackages = async (req, res) => {
  res.json({ success: true, data: PACKAGES });
};

// ─── TENANT OWNER: Subscription Management ───

// @desc    Get own tenant subscription details
// @route   GET /api/subscription
exports.getMySubscription = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const pkg = PACKAGES[tenant.plan] || PACKAGES.free;
    const userCount = await User.countDocuments({ tenant: tenant._id });

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant._id,
          name: tenant.name,
          plan: tenant.plan,
          planDetails: pkg,
          subscriptionStatus: tenant.subscriptionStatus,
          trialEndsAt: tenant.trialEndsAt,
          subscriptionStartDate: tenant.subscriptionStartDate,
          subscriptionEndDate: tenant.subscriptionEndDate,
          billingCycle: tenant.billingCycle,
          isDemo: tenant.isDemo,
          currentUsers: userCount,
          payments: tenant.payments.slice(-10), // Last 10 payments
        },
        packages: PACKAGES,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update station profile (name, brand, city, etc.)
// @route   PUT /api/subscription/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, brand, city, province, phone, email, address, logo } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (brand !== undefined) update.brand = brand;
    if (city !== undefined) update.city = city;
    if (province !== undefined) update.province = province;
    if (phone !== undefined) update.phone = phone;
    if (email !== undefined) update.email = email;
    if (address !== undefined) update.address = address;
    if (logo !== undefined) update.logo = logo;

    const tenant = await Tenant.findByIdAndUpdate(req.tenantId, update, { new: true });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
