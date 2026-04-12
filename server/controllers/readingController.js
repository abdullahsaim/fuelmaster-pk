const Reading = require('../models/Reading');
const Tank = require('../models/Tank');
const StockMovement = require('../models/StockMovement');

exports.list = async (req, res) => {
  try {
    const { startDate, endDate, nozzle, shift, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (req.tenantId) filter.tenant = req.tenantId;
    if (nozzle) filter.nozzle = nozzle;
    if (shift)  filter.shift = shift;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const total = await Reading.countDocuments(filter);
    const data = await Reading.find(filter)
      .populate('nozzle', 'name')
      .populate('pump', 'name')
      .populate('fuelType', 'name code color unit')
      .populate('tank', 'name')
      .populate('operator', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, count: data.length, total, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const r = await Reading.create({ ...req.body, tenant: req.tenantId, recordedBy: req.user._id });

    // Decrement tank stock by dispensed quantity (book stock follows readings)
    if (r.tank && r.dispensed > 0) {
      const tank = await Tank.findByIdAndUpdate(r.tank, { $inc: { currentStock: -r.dispensed } }, { new: true });
      await StockMovement.create({
        tenant: req.tenantId,
        date: r.date, tank: r.tank, fuelType: r.fuelType, type: 'OUT',
        quantity: r.dispensed, source: 'reading', reference: r._id, refModel: 'Reading',
        balanceAfter: tank?.currentStock, createdBy: req.user._id,
        notes: `Shift reading ${r.shift}`,
      });
    }
    const populated = await Reading.findById(r._id)
      .populate('nozzle', 'name').populate('fuelType', 'name code color unit').populate('tank', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const r = await Reading.findOne(filter);
    if (!r) return res.status(404).json({ success: false, message: 'Not found' });
    if (r.tank && r.dispensed > 0) {
      await Tank.findByIdAndUpdate(r.tank, { $inc: { currentStock: r.dispensed } });
    }
    await StockMovement.deleteMany({ reference: r._id, refModel: 'Reading' });
    await r.deleteOne();
    res.json({ success: true, message: 'Reading removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
