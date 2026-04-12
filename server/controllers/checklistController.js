const Checklist = require('../models/Checklist');

exports.getChecklists = async (req, res) => {
  try {
    const { date, shift, type, startDate, endDate } = req.query;
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
    if (shift) filter.shift = shift;
    if (type) filter.type = type;

    const data = await Checklist.find(filter)
      .populate('completedBy', 'name role')
      .populate('verifiedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChecklist = async (req, res) => {
  try {
    const { date, shift, type, completedBy } = req.body;
    const items = req.body.items || Checklist.defaultItems(type);
    const data = await Checklist.create({ tenant: req.tenantId, date, shift, type, items, completedBy });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    const update = { ...req.body };
    if (update.items) {
      const allChecked = update.items.every(i => i.checked);
      if (allChecked) update.status = 'Completed';
      else update.status = 'Incomplete';
    }
    if (update.status === 'Verified') update.verifiedBy = req.user._id;

    const data = await Checklist.findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .populate('completedBy', 'name role')
      .populate('verifiedBy', 'name');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteChecklist = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.tenantId) filter.tenant = req.tenantId;
    await Checklist.findOneAndDelete(filter);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
