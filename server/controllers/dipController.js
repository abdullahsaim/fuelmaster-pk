const Dip = require('../models/Dip');
const Tank = require('../models/Tank');
const StockMovement = require('../models/StockMovement');

exports.list = async (req, res) => {
  try {
    const { tank, startDate, endDate, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (req.tenantId) filter.tenant = req.tenantId;
    if (tank) filter.tank = tank;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    const total = await Dip.countDocuments(filter);
    const data = await Dip.find(filter)
      .populate('tank', 'name capacity currentStock')
      .populate('fuelType', 'name unit color')
      .populate('recordedBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, count: data.length, total, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const tank = await Tank.findById(req.body.tank).populate('fuelType');
    if (!tank) return res.status(404).json({ success: false, message: 'Tank not found' });

    const dip = await Dip.create({
      ...req.body,
      tenant: req.tenantId,
      bookStock: req.body.bookStock ?? tank.currentStock,
      fuelType: tank.fuelType?._id,
      recordedBy: req.user._id,
    });

    // Optionally adjust tank stock to physical reading
    if (dip.adjustStock) {
      tank.currentStock = dip.physicalStock;
      await tank.save();
      await StockMovement.create({
        tenant: req.tenantId,
        date: dip.date, tank: tank._id, fuelType: tank.fuelType?._id, type: 'ADJUST',
        quantity: Math.abs(dip.variance), source: 'dip', reference: dip._id, refModel: 'Dip',
        balanceAfter: tank.currentStock, createdBy: req.user._id,
        notes: `Dip adjustment (${dip.variance >= 0 ? 'gain' : 'loss'})`,
      });
    }
    res.status(201).json({ success: true, data: dip });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const dip = await Dip.findOne(filter);
    if (!dip) return res.status(404).json({ success: false, message: 'Not found' });
    if (dip.adjustStock) {
      await Tank.findByIdAndUpdate(dip.tank, { $inc: { currentStock: -dip.variance } });
      await StockMovement.deleteMany({ reference: dip._id, refModel: 'Dip' });
    }
    await dip.deleteOne();
    res.json({ success: true, message: 'Dip removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
