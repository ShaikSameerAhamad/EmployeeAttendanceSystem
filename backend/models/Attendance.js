import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Date is required'],
    },
    checkInTime: {
      type: String, // Format: HH:mm
      default: null,
    },
    checkOutTime: {
      type: String, // Format: HH:mm
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      required: [true, 'Status is required'],
      default: 'absent',
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

