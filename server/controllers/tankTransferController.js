const Tank = require('../models/Tank');
const StockMovement = require('../models/StockMovement');

exports.transfer = async (req, res) => {
  try {
    const { fromTank, toTank, quantity, notes } = req.body;
    if (!fromTank || !toTank || !quantity) {
      return res.status(400).json({ success: false, message: 'fromTank, toTank, and quantity are required' });
    }
    if (fromTank === toTank) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to the same tank' });
    }
    const qty = Number(quantity);
    if (qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be positive' });

    const sourceFilter = { _id: fromTank };
    const destFilter = { _id: toTank };
    if (req.tenantId) {
      sourceFilter.tenant = req.tenantId;
      destFilter.tenant = req.tenantId;
    }

    const source = await Tank.findOne(sourceFilter).populate('fuelType', 'name');
    const dest = await Tank.findOne(destFilter).populate('fuelType', 'name');
    if (!source || !dest) return res.status(404).json({ success: false, message: 'Tank not found' });

    if (source.currentStock < qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock in ${source.name}. Available: ${source.currentStock} L` });
    }
    if (dest.currentStock + qty > dest.capacity) {
      return res.status(400).json({ success: false, message: `Transfer would exceed ${dest.name} capacity. Space: ${dest.capacity - dest.currentStock} L` });
    }

    source.currentStock -= qty;
    await source.save();
    dest.currentStock += qty;
    await dest.save();

    await StockMovement.create({
      tenant: req.tenantId,
      date: new Date(), tank: fromTank, product: source.fuelType?._id,
      fuelType: source.fuelType?._id, type: 'OUT', quantity: qty,
      source: 'transfer', balanceAfter: source.currentStock,
      notes: `Transfer to ${dest.name}. ${notes || ''}`, createdBy: req.user._id,
    });
    await StockMovement.create({
      tenant: req.tenantId,
      date: new Date(), tank: toTank, product: dest.fuelType?._id,
      fuelType: dest.fuelType?._id, type: 'IN', quantity: qty,
      source: 'transfer', balanceAfter: dest.currentStock,
      notes: `Transfer from ${source.name}. ${notes || ''}`, createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: `Transferred ${qty} L from ${source.name} to ${dest.name}`,
      data: { from: { name: source.name, stock: source.currentStock }, to: { name: dest.name, stock: dest.currentStock } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
