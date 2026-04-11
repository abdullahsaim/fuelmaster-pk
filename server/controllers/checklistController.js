const Checklist = require('../models/Checklist');

// @desc    Get checklists
// @route   GET /api/checklists
exports.getChecklists = async (req, res) => {
  try {
    const { date, shift, type, startDate, endDate } = req.query;
    const filter = {};
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

// @desc    Create checklist with default items
// @route   POST /api/checklists
exports.createChecklist = async (req, res) => {
  try {
    const { date, shift, type, completedBy } = req.body;
    const items = req.body.items || Checklist.defaultItems(type);
    const data = await Checklist.create({ date, shift, type, items, completedBy });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update checklist (check/uncheck items)
// @route   PUT /api/checklists/:id
exports.updateChecklist = async (req, res) => {
  try {
    const update = { ...req.body };
    // Auto-set status based on items
    if (update.items) {
      const allChecked = update.items.every(i => i.checked);
      if (allChecked) update.status = 'Completed';
      else update.status = 'Incomplete';
    }
    if (update.status === 'Verified') update.verifiedBy = req.user._id;

    const data = await Checklist.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('completedBy', 'name role')
      .populate('verifiedBy', 'name');
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/checklists/:id
exports.deleteChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
