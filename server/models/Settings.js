const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  stationName: { type: String, default: 'My Filling Station' },
  brand: { type: String, default: 'PSO' },                    // PSO, Shell, Total, Attock, etc.
  dealerLicense: { type: String },
  ownerName: { type: String },
  address: { type: String },
  city: { type: String },
  province: { type: String, enum: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'GB'] },
  phone: { type: String },
  email: { type: String },
  ntn: { type: String },                                       // National Tax Number
  strn: { type: String },                                      // Sales Tax Registration Number
  gst: { type: Number, default: 17 },                         // GST percentage
  dayShiftStart: { type: String, default: '06:00' },
  dayShiftEnd: { type: String, default: '18:00' },
  nightShiftStart: { type: String, default: '18:00' },
  nightShiftEnd: { type: String, default: '06:00' },
  currency: { type: String, default: 'PKR' },
  logo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
