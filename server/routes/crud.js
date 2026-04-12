const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { tenantScope, featureGate, limitCheck } = require('../middleware/tenant');
const createCrudController = require('../controllers/crudFactory');

// Models
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Employee = require('../models/Employee');
const Expense = require('../models/Expense');
const FuelType = require('../models/FuelType');
const Tank = require('../models/Tank');
const Nozzle = require('../models/Nozzle');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// ─── Factory-generated routes (tenant-scoped) ───

function makeCrudRouter(Model, populateFields = '', writeRoles = ['owner', 'manager'], featureKey = null, limitKey = null) {
  const ctrl = createCrudController(Model, populateFields);
  const r = require('express').Router();
  r.use(protect);
  r.use(tenantScope);
  if (featureKey) r.use(featureGate(featureKey));

  const createMiddleware = limitKey ? [authorize(...writeRoles), limitCheck(Model, limitKey)] : [authorize(...writeRoles)];
  r.route('/').get(ctrl.getAll).post(...createMiddleware, ctrl.create);
  r.route('/:id').get(ctrl.getOne).put(authorize(...writeRoles), ctrl.update).delete(authorize('owner'), ctrl.remove);
  return r;
}

module.exports = {
  suppliersRouter:  makeCrudRouter(Supplier, '', ['owner', 'manager'], 'suppliers', 'maxSuppliers'),
  customersRouter:  makeCrudRouter(Customer, '', ['owner', 'manager'], 'customers', 'maxCustomers'),
  employeesRouter:  makeCrudRouter(Employee, '', ['owner', 'manager'], 'employees', 'maxEmployees'),
  expensesRouter:   makeCrudRouter(Expense, '', ['owner', 'manager'], 'expenses'),
  fuelTypesRouter:  makeCrudRouter(FuelType, '', ['owner', 'manager'], 'fuel_types'),
  tanksRouter:      makeCrudRouter(Tank, 'fuelType', ['owner', 'manager'], 'stock', 'maxTanks'),
  nozzlesRouter:    makeCrudRouter(Nozzle, 'tank', ['owner', 'manager'], 'stock', 'maxNozzles'),
  productsRouter:   makeCrudRouter(Product, 'supplier'),
  settingsRouter:   makeCrudRouter(Settings, '', ['owner', 'manager'], 'settings'),
};
