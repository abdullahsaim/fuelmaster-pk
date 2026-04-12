const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.getAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate, employee } = req.query;
    const filter = {};
    if (req.tenantId) filter.tenant = req.tenantId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    if (employee) filter.employee = employee;

    const data = await Attendance.find(filter)
      .populate('employee', 'name role shift cnic')
      .sort({ date: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkMark = async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !records?.length) return res.status(400).json({ success: false, message: 'Date and records required' });

    const results = [];
    for (const rec of records) {
      const existing = await Attendance.findOne({ tenant: req.tenantId, date: new Date(date), employee: rec.employee });
      if (existing) {
        Object.assign(existing, rec, { markedBy: req.user._id });
        await existing.save();
        results.push(existing);
      } else {
        const att = await Attendance.create({ ...rec, tenant: req.tenantId, date: new Date(date), markedBy: req.user._id });
        results.push(att);
      }
    }

    const populated = await Attendance.find({ tenant: req.tenantId, date: new Date(date) })
      .populate('employee', 'name role shift cnic');
    res.status(201).json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.monthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ success: false, message: 'Month required (YYYY-MM)' });

    const [year, m] = month.split('-').map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);
    const totalDays = new Date(year, m, 0).getDate();

    const empFilter = { status: 'Active' };
    if (req.tenantId) empFilter.tenant = req.tenantId;
    const employees = await Employee.find(empFilter).select('name role shift salary');

    const attFilter = { date: { $gte: start, $lte: end } };
    if (req.tenantId) attFilter.tenant = req.tenantId;
    const attendance = await Attendance.find(attFilter);

    const summary = employees.map(emp => {
      const records = attendance.filter(a => a.employee.toString() === emp._id.toString());
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const late = records.filter(r => r.status === 'Late').length;
      const halfDay = records.filter(r => r.status === 'Half Day').length;
      const leave = records.filter(r => r.status === 'Leave').length;
      const ot = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);
      return {
        employee: emp, present, absent, late, halfDay, leave, overtime: ot,
        marked: records.length, totalDays,
        attendancePct: records.length > 0 ? Math.round((present + late + halfDay * 0.5) / records.length * 100) : 0,
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    await Attendance.findOneAndDelete(filter);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
