const User = require('../models/User');
const Tenant = require('../models/Tenant');

// @desc    Register new station (creates Tenant + Owner user + free trial)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, cnic, stationName, city, province, brand } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 1. Create tenant (station)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day free trial

    const tenant = await Tenant.create({
      name: stationName || `${name}'s Station`,
      brand: brand || 'Other',
      city,
      province,
      phone,
      email,
      plan: 'free',
      subscriptionStatus: 'trial',
      trialEndsAt,
      currentUsers: 1,
    });

    // 2. Create owner user linked to tenant
    const user = await User.create({
      name, email, password, role: 'owner', phone, cnic,
      tenant: tenant._id,
    });

    // 3. Link tenant back to owner
    tenant.owner = user._id;
    await tenant.save();

    const token = user.getSignedToken();
    const { PACKAGES } = require('../models/Tenant');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
        trialEndsAt: tenant.trialEndsAt,
        features: PACKAGES[tenant.plan].features,
        limits: PACKAGES[tenant.plan],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact your station owner.' });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = user.getSignedToken();

    // Build response
    const response = {
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };

    // Attach tenant info (superadmin has no tenant)
    if (user.tenant) {
      const tenant = await Tenant.findById(user.tenant);
      if (tenant) {
        const { PACKAGES } = require('../models/Tenant');
        const pkg = PACKAGES[tenant.plan] || PACKAGES.free;
        response.tenant = {
          id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          subscriptionStatus: tenant.subscriptionStatus,
          trialEndsAt: tenant.trialEndsAt,
          subscriptionEndDate: tenant.subscriptionEndDate,
          isDemo: tenant.isDemo,
          features: pkg.features,
          reports: pkg.reports,
          limits: pkg,
        };
      }
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user + tenant info
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const response = { success: true, user };

    if (user.tenant) {
      const tenant = await Tenant.findById(user.tenant);
      if (tenant) {
        const { PACKAGES } = require('../models/Tenant');
        const pkg = PACKAGES[tenant.plan] || PACKAGES.free;
        response.tenant = {
          id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          subscriptionStatus: tenant.subscriptionStatus,
          trialEndsAt: tenant.trialEndsAt,
          subscriptionEndDate: tenant.subscriptionEndDate,
          isDemo: tenant.isDemo,
          features: pkg.features,
          reports: pkg.reports,
          limits: pkg,
        };
      }
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add user to tenant (owner/manager adds team members)
// @route   POST /api/auth/users
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, cnic } = req.body;

    if (!req.tenantId) {
      return res.status(403).json({ success: false, message: 'Tenant context required' });
    }

    // Check user limit
    const tenant = await Tenant.findById(req.tenantId);
    const { PACKAGES } = require('../models/Tenant');
    const pkg = PACKAGES[tenant.plan] || PACKAGES.free;
    const currentUsers = await User.countDocuments({ tenant: req.tenantId });
    if (currentUsers >= pkg.maxUsers) {
      return res.status(403).json({
        success: false,
        message: `User limit reached (${pkg.maxUsers}) for your ${tenant.plan} plan. Upgrade for more.`,
        code: 'LIMIT_REACHED',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Prevent creating superadmin or owner via this route
    const allowedRoles = ['manager', 'cashier', 'operator'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    const user = await User.create({
      name, email, password, role, phone, cnic,
      tenant: req.tenantId,
    });

    // Update tenant user count
    tenant.currentUsers = currentUsers + 1;
    await tenant.save();

    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for tenant
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.tenantId) filter.tenant = req.tenantId;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user (toggle active, change role)
// @route   PUT /api/auth/users/:id
exports.updateUser = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;

    const { name, phone, cnic, role, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (cnic !== undefined) update.cnic = cnic;
    if (role !== undefined) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;

    const user = await User.findOneAndUpdate(filter, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
