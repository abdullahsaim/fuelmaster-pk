const ShiftHandover = require('../models/ShiftHandover');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Reading = require('../models/Reading');
const Tank = require('../models/Tank');

// @desc    Get shift handovers
// @route   GET /api/shift-handovers
exports.getHandovers = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
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

// @desc    Auto-populate shift data for handover
// @route   GET /api/shift-handovers/populate?date=YYYY-MM-DD&shift=day
exports.populateShift = async (req, res) => {
  try {
    const { date, shift } = req.query;
    if (!date || !shift) return res.status(400).json({ success: false, message: 'Date and shift required' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dateMatch = { date: { $gte: dayStart, $lt: dayEnd }, shift };

    // Sales summary
    const salesAgg = await Sale.aggregate([
      { $match: dateMatch },
      { $group: { _id: '$saleType', total: { $sum: '$amount' }, qty: { $sum: '$quantity' } } },
    ]);
    const cashSales = salesAgg.find(s => s._id === 'cash')?.total || 0;
    const creditSales = salesAgg.find(s => s._id === 'credit')?.total || 0;

    // Expenses
    const expAgg = await Expense.aggregate([
      { $match: { date: { $gte: dayStart, $lt: dayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Readings
    const readings = await Reading.find(dateMatch).populate('nozzle', 'name');
    const meterReadings = readings.map(r => ({
      nozzle: r.nozzle?._id, nozzleName: r.nozzle?.name || '—',
      closing: r.closing, dispensed: r.dispensed,
    }));

    // Tank levels
    const tanks = await Tank.find().populate('fuelType', 'name');
    const tankLevels = tanks.map(t => ({ tank: t._id, tankName: `${t.name} (${t.fuelType?.name || ''})`, level: t.currentStock }));

    // Short/excess from readings
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

// @desc    Create shift handover
// @route   POST /api/shift-handovers
exports.createHandover = async (req, res) => {
  try {
    const data = await ShiftHandover.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Acknowledge handover (incoming operator)
// @route   PUT /api/shift-handovers/:id/acknowledge
exports.acknowledgeHandover = async (req, res) => {
  try {
    const data = await ShiftHandover.findByIdAndUpdate(req.params.id, {
      status: 'Acknowledged', acknowledgedAt: new Date(), incomingOperator: req.body.incomingOperator,
    }, { new: true }).populate('outgoingOperator incomingOperator', 'name role');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/shift-handovers/:id
exports.deleteHandover = async (req, res) => {
  try {
    const data = await ShiftHandover.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
