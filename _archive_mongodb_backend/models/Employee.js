// ফাইল পাথ: src/models/Employee.js
import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required.'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required.'],
  },
  standardDutyMinutes: {
    type: Number,
    required: [true, 'Standard duty time is required in minutes.'],
    default: 550,
  },
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);