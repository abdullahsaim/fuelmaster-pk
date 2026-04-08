require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const FuelType = require('../models/FuelType');
const Tank = require('../models/Tank');
const Nozzle = require('../models/Nozzle');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding FuelMaster PK database...\n');

  // Clear all collections
  await Promise.all([
    User.deleteMany(), FuelType.deleteMany(), Tank.deleteMany(), Nozzle.deleteMany(),
    Supplier.deleteMany(), Customer.deleteMany(), Employee.deleteMany(),
    Sale.deleteMany(), Purchase.deleteMany(), Expense.deleteMany(),
    Product.deleteMany(), Settings.deleteMany(),
  ]);
  console.log('   ✅ Cleared existing data');

  // 1. Settings
  await Settings.create({
    stationName: 'Al-Noor Filling Station',
    brand: 'PSO',
    dealerLicense: 'PSO-GRW-2847',
    ownerName: 'Haji Muhammad Nawaz',
    address: 'GT Road, Near Cantt, Gujranwala',
    city: 'Gujranwala',
    province: 'Punjab',
    phone: '055-3812345',
    email: 'alnoor.filling@gmail.com',
    ntn: '1234567-8',
    strn: '33-00-4567-890-12',
  });
  console.log('   ✅ Station settings');

  // 2. Users
  const owner = await User.create({ name: 'Haji Nawaz', email: 'owner@fuelmaster.pk', password: 'admin123', role: 'owner', phone: '0300-1234567' });
  const manager = await User.create({ name: 'Muhammad Aslam', email: 'manager@fuelmaster.pk', password: 'manager123', role: 'manager', phone: '0300-1112233' });
  await User.create({ name: 'Rashid Ahmed', email: 'cashier@fuelmaster.pk', password: 'cashier123', role: 'cashier', phone: '0321-4445566' });
  console.log('   ✅ Users (owner/manager/cashier)');

  // 3. Fuel Types (April 2026 OGRA rates)
  const petrol = await FuelType.create({ name: 'Petrol (RON 92)', code: 'petrol', currentRate: 321.17, unit: 'Ltr', color: '#22c55e',
    rateHistory: [{ rate: 321.17, effectiveFrom: new Date('2026-04-03'), ograNotification: 'OGRA-2026-04-03' }] });
  const diesel = await FuelType.create({ name: 'Hi-Speed Diesel', code: 'diesel', currentRate: 335.86, unit: 'Ltr', color: '#3b82f6',
    rateHistory: [{ rate: 335.86, effectiveFrom: new Date('2026-04-03'), ograNotification: 'OGRA-2026-04-03' }] });
  const hobc = await FuelType.create({ name: 'Hi-Octane (HOBC)', code: 'hobc', currentRate: 458.41, unit: 'Ltr', color: '#f59e0b',
    rateHistory: [{ rate: 458.41, effectiveFrom: new Date('2026-04-03'), ograNotification: 'OGRA-2026-04-03' }] });
  const cng = await FuelType.create({ name: 'CNG', code: 'cng', currentRate: 304.12, unit: 'Kg', color: '#8b5cf6',
    rateHistory: [{ rate: 304.12, effectiveFrom: new Date('2026-04-01') }] });
  console.log('   ✅ Fuel types with OGRA rates');

  // 4. Tanks
  const tankA = await Tank.create({ name: 'Tank A (Petrol)', fuelType: petrol._id, capacity: 25000, currentStock: 18450, minLevel: 2000 });
  const tankB = await Tank.create({ name: 'Tank B (Diesel)', fuelType: diesel._id, capacity: 30000, currentStock: 22100, minLevel: 3000 });
  const tankC = await Tank.create({ name: 'Tank C (HOBC)', fuelType: hobc._id, capacity: 10000, currentStock: 6800, minLevel: 1000 });
  const tankD = await Tank.create({ name: 'CNG Storage', fuelType: cng._id, capacity: 5000, currentStock: 3200, minLevel: 500 });
  console.log('   ✅ Tanks');

  // 5. Nozzles
  const nozzles = await Nozzle.insertMany([
    { name: 'Nozzle 1-A', tank: tankA._id, status: 'active' },
    { name: 'Nozzle 1-B', tank: tankA._id, status: 'active' },
    { name: 'Nozzle 2-A', tank: tankB._id, status: 'active' },
    { name: 'Nozzle 2-B', tank: tankB._id, status: 'inactive' },
    { name: 'Nozzle 3-A', tank: tankC._id, status: 'active' },
  ]);
  console.log('   ✅ Nozzles');

  // 6. Suppliers
  const suppliers = await Supplier.insertMany([
    { name: 'Pakistan State Oil (PSO)', type: 'Fuel', city: 'Karachi', phone: '021-111-111-776', balance: 2450000 },
    { name: 'Shell Pakistan Ltd', type: 'Fuel', city: 'Karachi', phone: '021-111-888-222', balance: 1820000 },
    { name: 'Total PARCO Pakistan', type: 'Fuel', city: 'Lahore', phone: '042-111-222-444', balance: 960000 },
    { name: 'Attock Petroleum', type: 'Fuel', city: 'Rawalpindi', phone: '051-111-123-456', balance: 540000 },
    { name: 'Castrol Pakistan', type: 'Lubricant', city: 'Lahore', phone: '042-111-333-555', balance: 185000 },
  ]);
  console.log('   ✅ Suppliers');

  // 7. Customers
  const customers = await Customer.insertMany([
    { name: 'Daewoo Express', type: 'Fleet', city: 'Lahore', phone: '0300-1234567', creditLimit: 500000, balance: 324500, totalVehicles: 12 },
    { name: 'Punjab Transport Co.', type: 'Fleet', city: 'Gujranwala', phone: '0321-7654321', creditLimit: 300000, balance: 187200, totalVehicles: 8 },
    { name: 'Ali Construction', type: 'Corporate', city: 'Gujranwala', phone: '0333-4567890', creditLimit: 200000, balance: 95600, totalVehicles: 5 },
    { name: 'Metro Logistics', type: 'Fleet', city: 'Sialkot', phone: '0345-9876543', creditLimit: 400000, balance: 267800, totalVehicles: 15 },
    { name: 'Pak Army (Cantt)', type: 'Government', city: 'Gujranwala', phone: '055-9201234', creditLimit: 600000, balance: 412000, totalVehicles: 20 },
    { name: 'Walk-in Customer', type: 'Cash', city: '-', phone: '-', creditLimit: 0, balance: 0, totalVehicles: 0 },
  ]);
  console.log('   ✅ Customers');

  // 8. Employees
  const employees = await Employee.insertMany([
    { name: 'Muhammad Aslam', cnic: '35202-1234567-1', role: 'Manager', shift: 'Day', phone: '0300-1112233', salary: 85000, joinDate: '2022-03-15' },
    { name: 'Rashid Ahmed', cnic: '35202-2345678-3', role: 'Cashier', shift: 'Day', phone: '0321-4445566', salary: 45000, joinDate: '2023-01-10' },
    { name: 'Imran Khan', cnic: '35202-3456789-5', role: 'Pump Operator', shift: 'Day', phone: '0333-7778899', salary: 35000, joinDate: '2023-06-01' },
    { name: 'Bilal Hussain', cnic: '35202-4567890-7', role: 'Pump Operator', shift: 'Night', phone: '0345-1234567', salary: 35000, joinDate: '2023-08-20' },
    { name: 'Farooq Aziz', cnic: '35202-5678901-9', role: 'Cashier', shift: 'Night', phone: '0312-9876543', salary: 45000, joinDate: '2024-02-01' },
    { name: 'Sajid Mehmood', cnic: '35202-6789012-1', role: 'Guard', shift: 'Night', phone: '0301-5551234', salary: 28000, joinDate: '2022-11-01' },
    { name: 'Tariq Wali', cnic: '35202-7890123-3', role: 'Helper', shift: 'Day', phone: '0346-3214567', salary: 25000, joinDate: '2024-06-15' },
  ]);
  console.log('   ✅ Employees');

  // 9. Products (Lubricants)
  await Product.insertMany([
    { name: 'PSO Dexron ATF', category: 'Automotive', brand: 'PSO', purchaseRate: 2100, saleRate: 2450, stock: 48, supplier: suppliers[0]._id },
    { name: 'Shell Helix HX7 5W-40', category: 'Engine Oil', brand: 'Shell', purchaseRate: 3600, saleRate: 4200, stock: 36, supplier: suppliers[1]._id },
    { name: 'Total Quartz 9000 5W-30', category: 'Engine Oil', brand: 'Total', purchaseRate: 3200, saleRate: 3800, stock: 24, supplier: suppliers[2]._id },
    { name: 'Castrol GTX 20W-50', category: 'Engine Oil', brand: 'Castrol', purchaseRate: 2400, saleRate: 2900, stock: 42, supplier: suppliers[4]._id },
    { name: 'PSO Motor Oil 4T', category: 'Motorcycle', brand: 'PSO', purchaseRate: 680, saleRate: 850, stock: 120, supplier: suppliers[0]._id },
  ]);
  console.log('   ✅ Products (lubricants)');

  // 10. Generate 30 days of sales
  const fuelTypes = [
    { fuel: petrol, tank: tankA, nozzles: [nozzles[0]._id, nozzles[1]._id] },
    { fuel: diesel, tank: tankB, nozzles: [nozzles[2]._id, nozzles[3]._id] },
    { fuel: hobc,   tank: tankC, nozzles: [nozzles[4]._id] },
    { fuel: cng,    tank: tankD, nozzles: [] },
  ];
  const cashCustomer = customers[5]._id;
  const creditCustomers = customers.slice(0, 5).map(c => c._id);
  const salesBulk = [];

  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(12, 0, 0, 0);

    for (const ft of fuelTypes) {
      const baseQty = ft.fuel.code === 'cng' ? 300 : 800;
      const qty = Math.round(baseQty + Math.random() * 400);
      const cashQty = Math.round(qty * 0.7);
      const creditQty = qty - cashQty;

      // Cash sale
      salesBulk.push({
        date, shift: 'day', fuelType: ft.fuel._id, tank: ft.tank._id,
        nozzle: ft.nozzles[0] || undefined, quantity: cashQty, rate: ft.fuel.currentRate,
        amount: cashQty * ft.fuel.currentRate, saleType: 'cash', receivedBy: owner._id,
      });
      // Credit sale
      if (creditQty > 0) {
        salesBulk.push({
          date, shift: 'day', fuelType: ft.fuel._id, tank: ft.tank._id,
          nozzle: ft.nozzles[0] || undefined, quantity: creditQty, rate: ft.fuel.currentRate,
          amount: creditQty * ft.fuel.currentRate, saleType: 'credit',
          customer: creditCustomers[Math.floor(Math.random() * creditCustomers.length)],
          receivedBy: owner._id,
        });
      }
    }
  }
  await Sale.insertMany(salesBulk);
  console.log(`   ✅ Sales (${salesBulk.length} records for 30 days)`);

  // 11. Purchases
  await Purchase.insertMany([
    { date: new Date('2026-04-05'), supplier: suppliers[0]._id, fuelType: petrol._id, tank: tankA._id, quantity: 15000, rate: 318.50, amount: 4777500, tankerNumber: 'LHR-4521', status: 'Received', receivedQuantity: 15000, receivedBy: manager._id },
    { date: new Date('2026-04-03'), supplier: suppliers[1]._id, fuelType: diesel._id, tank: tankB._id, quantity: 20000, rate: 333.20, amount: 6664000, tankerNumber: 'KHI-7832', status: 'Received', receivedQuantity: 20000, receivedBy: manager._id },
    { date: new Date('2026-04-01'), supplier: suppliers[2]._id, fuelType: hobc._id, tank: tankC._id, quantity: 8000, rate: 455.00, amount: 3640000, tankerNumber: 'LHR-2198', status: 'Received', receivedQuantity: 8000, receivedBy: manager._id },
    { date: new Date('2026-03-28'), supplier: suppliers[0]._id, fuelType: petrol._id, tank: tankA._id, quantity: 15000, rate: 316.80, amount: 4752000, tankerNumber: 'ISB-3345', status: 'Received', receivedQuantity: 15000, receivedBy: manager._id },
    { date: new Date('2026-03-25'), supplier: suppliers[1]._id, fuelType: diesel._id, tank: tankB._id, quantity: 20000, rate: 331.50, amount: 6630000, tankerNumber: 'KHI-9012', status: 'Received', receivedQuantity: 20000, receivedBy: manager._id },
  ]);
  console.log('   ✅ Purchases');

  // 12. Expenses
  await Expense.insertMany([
    { date: new Date('2026-04-06'), category: 'Electricity', description: 'WAPDA Bill March', amount: 125000, paymentMethod: 'Bank Transfer', recordedBy: manager._id },
    { date: new Date('2026-04-05'), category: 'Maintenance', description: 'Dispenser Repair - Nozzle 2B', amount: 18500, paymentMethod: 'Cash', recordedBy: manager._id },
    { date: new Date('2026-04-04'), category: 'Sui Gas', description: 'Sui Northern Gas Bill', amount: 45000, paymentMethod: 'Bank Transfer', recordedBy: manager._id },
    { date: new Date('2026-04-03'), category: 'Salary Advance', description: 'Advance to Imran Khan', amount: 10000, paymentMethod: 'Cash', recordedBy: manager._id },
    { date: new Date('2026-04-02'), category: 'Rent', description: 'Monthly Land Lease', amount: 250000, paymentMethod: 'Cheque', recordedBy: owner._id },
    { date: new Date('2026-04-01'), category: 'Transport', description: 'Tanker Unloading Charges', amount: 8000, paymentMethod: 'Cash', recordedBy: manager._id },
    { date: new Date('2026-03-30'), category: 'Office', description: 'Stationery & Printer Ink', amount: 3500, paymentMethod: 'Cash', recordedBy: manager._id },
    { date: new Date('2026-03-28'), category: 'Tax', description: 'Income Tax Quarterly', amount: 185000, paymentMethod: 'Bank Transfer', recordedBy: owner._id },
  ]);
  console.log('   ✅ Expenses');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n   Login credentials:');
  console.log('   ─────────────────────────────────────');
  console.log('   Owner:   owner@fuelmaster.pk   / admin123');
  console.log('   Manager: manager@fuelmaster.pk / manager123');
  console.log('   Cashier: cashier@fuelmaster.pk / cashier123');
  console.log('   ─────────────────────────────────────\n');

  process.exit(0);
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
