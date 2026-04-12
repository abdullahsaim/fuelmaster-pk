const ShiftHandover = require('../models/ShiftHandover');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Reading = require('../models/Reading');
const Tank = require('../models/Tank');
const mongoose = require('mongoose');

const tFilter = (req) => req.tenantId ? { tenant: new mongoose.Types.ObjectId(req.tenantId) } : {};
const tQuery = (req) => req.tenantId ? { tenant: req.tenantId } : {};

exports.getHandovers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { ...tQuery(req) };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const data = await ShiftHandover.find(filter)
      .populate('outgoingOperator', 'name role')
      .populate('incomingOperator', 'name role')
      .sort({ date: -1, shift: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.populateShift = async (req, res) => {
  try {
    const { date, shift } = req.query;
    if (!date || !shift) return res.status(400).json({ success: false, message: 'Date and shift required' });

    const tf = tFilter(req);
    const tq = tQuery(req);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dateMatch = { ...tf, date: { $gte: dayStart, $lt: dayEnd }, shift };

    const salesAgg = await Sale.aggregate([
      { $match: dateMatch },
      { $group: { _id: '$saleType', total: { $sum: '$amount' }, qty: { $sum: '$quantity' } } },
    ]);
    const cashSales = salesAgg.find(s => s._id === 'cash')?.total || 0;
    const creditSales = salesAgg.find(s => s._id === 'credit')?.total || 0;

    const expAgg = await Expense.aggregate([
      { $match: { ...tf, date: { $gte: dayStart, $lt: dayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const readingFilter = { ...tq, date: { $gte: dayStart, $lt: dayEnd }, shift };
    const readings = await Reading.find(readingFilter).populate('nozzle', 'name');
    const meterReadings = readings.map(r => ({
      nozzle: r.nozzle?._id, nozzleName: r.nozzle?.name || '—',
      closing: r.closing, dispensed: r.dispensed,
    }));

    const tanks = await Tank.find(tq).populate('fuelType', 'name');
    const tankLevels = tanks.map(t => ({ tank: t._id, tankName: `${t.name} (${t.fuelType?.name || ''})`, level: t.currentStock }));

    const shortExcess = readings.reduce((sum, r) => sum + (r.shortExcess || 0), 0);

    res.json({
      success: true,
      data: {
        totalSales: cashSales + creditSales,
        totalCashSales: cashSales,
        totalCreditSales: creditSales,
        expenses: expAgg[0]?.total || 0,
        shortExcess,
        meterReadings,
        tankLevels,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHandover = async (req, res) => {
  try {
    const data = await ShiftHandover.create({ ...req.body, tenant: req.tenantId, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acknowledgeHandover = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const data = await ShiftHandover.findOneAndUpdate(filter, {
      status: 'Acknowledged', acknowledgedAt: new Date(), incomingOperator: req.body.incomingOperator,
    }, { new: true }).populate('outgoingOperator incomingOperator', 'name role');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHandover = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const data = await ShiftHandover.findOneAndDelete(filter);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
