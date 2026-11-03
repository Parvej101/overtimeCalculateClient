import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  inTime: {
    type: Date,
    required: true,
  },
  outTime: {
    type: Date,
    required: true,
  },
  dutyHours: {
    type: Number,
    required: true,
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// একই দিনে একই এমপ্লয়ীর জন্য একাধিক অ্যাটেনডেন্স এন্ট্রি রোধ করা
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);