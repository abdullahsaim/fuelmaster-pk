/**
 * Seed Script — Creates superadmin + demo tenant with sample accounts
 *
 * Usage: node seed.js
 * Env:   requires MONGO_URI and JWT_SECRET in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Tenant = require('./models/Tenant');

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create superadmin (no tenant)
    const existingSuperadmin = await User.findOne({ role: 'superadmin' });
    if (!existingSuperadmin) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@fuelmaster.pk',
        password: 'admin123',
        role: 'superadmin',
        phone: '03001234567',
      });
      console.log('Superadmin created: superadmin@fuelmaster.pk / admin123');
    } else {
      console.log('Superadmin already exists:', existingSuperadmin.email);
    }

    // 2. Create demo tenant
    let demoTenant = await Tenant.findOne({ isDemo: true });
    if (!demoTenant) {
      demoTenant = await Tenant.create({
        name: 'Demo Filling Station',
        slug: 'demo-station',
        brand: 'PSO',
        city: 'Lahore',
        province: 'Punjab',
        phone: '042-35761234',
        email: 'demo@fuelmaster.pk',
        plan: 'professional',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isDemo: true,
        isActive: true,
        notes: 'Demo account for testing and demonstration',
      });
      console.log('Demo tenant created:', demoTenant.name);
    } else {
      console.log('Demo tenant already exists:', demoTenant.name);
    }

    // 3. Create demo users
    const demoUsers = [
      { name: 'Station Owner', email: 'owner@fuelmaster.pk', password: 'admin123', role: 'owner', phone: '03001111111' },
      { name: 'Station Manager', email: 'manager@fuelmaster.pk', password: 'admin123', role: 'manager', phone: '03002222222' },
      { name: 'Cashier Ali', email: 'cashier@fuelmaster.pk', password: 'admin123', role: 'cashier', phone: '03003333333' },
      { name: 'Pump Operator', email: 'operator@fuelmaster.pk', password: 'admin123', role: 'operator', phone: '03004444444' },
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const user = await User.create({ ...u, tenant: demoTenant._id });
        // Set first user as tenant owner
        if (u.role === 'owner' && !demoTenant.owner) {
          demoTenant.owner = user._id;
          demoTenant.currentUsers = demoUsers.length;
          await demoTenant.save();
        }
        console.log(`  Created ${u.role}: ${u.email} / ${u.password}`);
      } else {
        // Update tenant reference if missing
        if (!exists.tenant) {
          exists.tenant = demoTenant._id;
          await exists.save();
          console.log(`  Updated tenant for: ${u.email}`);
        } else {
          console.log(`  Already exists: ${u.email}`);
        }
      }
    }

    console.log('\n--- Seed Complete ---');
    console.log('Superadmin:  superadmin@fuelmaster.pk / admin123');
    console.log('Demo Owner:  owner@fuelmaster.pk / admin123');
    console.log('Demo Manager: manager@fuelmaster.pk / admin123');
    console.log('Demo Cashier: cashier@fuelmaster.pk / admin123');
    console.log('Demo Operator: operator@fuelmaster.pk / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
