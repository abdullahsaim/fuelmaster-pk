const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
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

// ─── Factory-generated routes ───

function makeCrudRouter(Model, populateFields = '', writeRoles = ['owner', 'manager']) {
  const ctrl = createCrudController(Model, populateFields);
  const r = require('express').Router();
  r.use(protect);
  r.route('/').get(ctrl.getAll).post(authorize(...writeRoles), ctrl.create);
  r.route('/:id').get(ctrl.getOne).put(authorize(...writeRoles), ctrl.update).delete(authorize('owner'), ctrl.remove);
  return r;
}

module.exports = {
  suppliersRouter:  makeCrudRouter(Supplier),
  customersRouter:  makeCrudRouter(Customer),
  employeesRouter:  makeCrudRouter(Employee),
  expensesRouter:   makeCrudRouter(Expense),
  fuelTypesRouter:  makeCrudRouter(FuelType),
  tanksRouter:      makeCrudRouter(Tank, 'fuelType'),
  nozzlesRouter:    makeCrudRouter(Nozzle, 'tank'),
  productsRouter:   makeCrudRouter(Product, 'supplier'),
  settingsRouter:   makeCrudRouter(Settings),
};
