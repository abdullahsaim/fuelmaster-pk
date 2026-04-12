const mongoose = require('mongoose');

const ChecklistSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['day', 'night'], required: true },
  type: { type: String, enum: ['opening', 'closing'], required: true },

  items: [{
    label: { type: String, required: true },
    checked: { type: Boolean, default: false },
    remarks: { type: String },
  }],

  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Incomplete', 'Completed', 'Verified'], default: 'Incomplete' },
  notes: { type: String },
}, { timestamps: true });

ChecklistSchema.index({ date: -1, shift: 1, type: 1 });

// Default checklist items for filling stations
ChecklistSchema.statics.defaultItems = (type) => {
  const opening = [
    'Fire extinguishers checked and accessible',
    'All pumps powered on and functional',
    'Nozzle condition checked (no leaks)',
    'Tank dip reading taken',
    'Cash float verified and counted',
    'Forecourt area clean and safe',
    'Price display boards updated',
    'Restrooms clean and stocked',
    'Generator fuel level checked',
    'CCTV cameras operational',
  ];
  const closing = [
    'All nozzle meter readings recorded',
    'Tank dip reading taken',
    'Cash counted and reconciled',
    'Credit sale slips collected and filed',
    'Pumps powered off / locked',
    'Forecourt lights on / secured',
    'Generator shut down (if running)',
    'Pending items noted for next shift',
    'Shift handover form completed',
    'Premises locked and secured',
  ];
  return (type === 'opening' ? opening : closing).map(label => ({ label, checked: false, remarks: '' }));
};

module.exports = mongoose.model('Checklist', ChecklistSchema);
