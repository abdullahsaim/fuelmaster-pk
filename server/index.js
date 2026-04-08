require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchases');
const payrollRoutes = require('./routes/payroll');
const dashboardRoutes = require('./routes/dashboard');
const operationsRoutes = require('./routes/operations');
const reportsRoutes = require('./routes/reports');
const {
  suppliersRouter, customersRouter, employeesRouter, expensesRouter,
  fuelTypesRouter, tanksRouter, nozzlesRouter, productsRouter, settingsRouter,
} = require('./routes/crud');

const app = express();

connectDB();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/auth',       authRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/sales',      salesRoutes);
app.use('/api/purchases',  purchaseRoutes);
app.use('/api/payroll',    payrollRoutes);
app.use('/api/suppliers',  suppliersRouter);
app.use('/api/customers',  customersRouter);
app.use('/api/employees',  employeesRouter);
app.use('/api/expenses',   expensesRouter);
app.use('/api/fuel-types', fuelTypesRouter);
app.use('/api/tanks',      tanksRouter);
app.use('/api/nozzles',    nozzlesRouter);
app.use('/api/products',   productsRouter);
app.use('/api/settings',   settingsRouter);
app.use('/api',            operationsRoutes);
app.use('/api/reports',    reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FuelMaster PK API running', version: '3.0.0', env: process.env.NODE_ENV });
});

// ─── Serve React (Vite build goes to server/public/) ───
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'public');
  if (fs.existsSync(path.join(buildPath, 'index.html'))) {
    console.log('Serving frontend from:', buildPath);
    app.use(express.static(buildPath));
    app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
  } else {
    console.error('Frontend not found at:', buildPath);
    app.get('*', (req, res) => res.json({
      success: false, message: 'Frontend not at ' + buildPath,
      hint: 'Build may have failed. Check deployment logs.',
      filesInServer: fs.readdirSync(__dirname),
      cwd: process.cwd()
    }));
  }
}

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`FuelMaster PK v3 running on port ${PORT}`));
module.exports = app;
