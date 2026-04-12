const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  date: { type: Date, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  shift: { type: String, enum: ['Day', 'Night'], required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'], default: 'Present' },
  checkIn: { type: String },   // "08:15" format
  checkOut: { type: String },
  overtimeHours: { type: Number, default: 0 },
  notes: { type: String },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

AttendanceSchema.index({ date: 1, employee: 1 }, { unique: true });
AttendanceSchema.index({ employee: 1, date: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
