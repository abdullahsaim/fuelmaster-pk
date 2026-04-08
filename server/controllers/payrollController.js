const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

exports.getPayrolls = async (req, res) => {
  try {
    const { month, year, status, employee } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;
    if (employee) filter.employee = employee;
    const payrolls = await Payroll.find(filter)
      .populate('employee', 'name cnic role shift salary phone')
      .sort({ createdAt: -1 });
    const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    res.json({ success: true, count: payrolls.length, totalPayroll, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate payroll for all active employees for a given month
exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }
    // Check if already generated
    const existing = await Payroll.findOne({ month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: `Payroll for ${month}/${year} already exists. Delete existing to regenerate.` });
    }
    const employees = await Employee.find({ status: 'Active' });
    const payrolls = [];
    for (const emp of employees) {
      const payroll = await Payroll.create({
        employee: emp._id,
        month,
        year,
        basicSalary: emp.salary,
        overtime: 0,
        bonus: 0,
        deductions: 0,
        advance: 0,
        loanDeduction: 0,
        eobi: Math.round(emp.salary * 0.01), // 1% EOBI
        status: 'Pending',
        processedBy: req.user._id,
        attendance: { totalDays: 30, present: 30, absent: 0, late: 0, leaves: 0 },
      });
      payrolls.push(payroll);
    }
    const populated = await Payroll.find({ month, year })
      .populate('employee', 'name cnic role shift salary phone');
    res.status(201).json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('employee', 'name cnic role shift salary phone');
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process all pending payrolls for a month (mark as Paid)
exports.processPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const result = await Payroll.updateMany(
      { month, year, status: 'Pending' },
      { $set: { status: 'Paid', paymentDate: new Date() } }
    );
    res.json({ success: true, message: `${result.modifiedCount} payrolls processed`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.json({ success: true, message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
