import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { format } from 'date-fns';
import { calculateCheckInStatus, calculateHoursAndStatus } from '../utils/calculateStatus.js';

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
export const checkIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkInTime = format(new Date(), 'HH:mm');

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      date: today,
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        data: existingAttendance,
      });
    }

    // Calculate status
    const status = calculateCheckInStatus(checkInTime);

    // Create or update attendance
    let attendance;
    if (existingAttendance) {
      attendance = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        {
          checkInTime,
          status,
        },
        { new: true }
      );
    } else {
      attendance = await Attendance.create({
        userId,
        date: today,
        checkInTime,
        status,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private (Employee)
export const checkOut = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkOutTime = format(new Date(), 'HH:mm');

    // Find today's attendance
    const attendance = await Attendance.findOne({
      userId,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today',
      });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first',
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today',
        data: attendance,
      });
    }

    // Calculate hours and final status
    const { totalHours, status } = calculateHoursAndStatus(
      attendance.checkInTime,
      checkOutTime,
      attendance.status
    );

    // Update attendance
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendance._id,
      {
        checkOutTime,
        totalHours,
        status,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: updatedAttendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Employee)
export const getMyHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let query = { userId };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my monthly summary
// @route   GET /api/attendance/my-summary
// @access  Private (Employee)
export const getMySummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const summary = {
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private (Employee)
export const getToday = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = format(new Date(), 'yyyy-MM-dd');

    const attendance = await Attendance.findOne({
      userId,
      date: today,
    });

    if (!attendance) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No attendance record for today',
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees attendance (Manager)
// @route   GET /api/attendance/all
// @access  Private (Manager)
export const getAllAttendance = async (req, res, next) => {
  try {
    const { date, status, employeeId, startDate, endDate } = req.query;

    let query = {};

    // Filter by date or date range
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (date) {
      query.date = date;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by employee
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1, createdAt: -1 })
      .limit(500);

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific employee attendance (Manager)
// @route   GET /api/attendance/employee/:id
// @access  Private (Manager)
export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    let query = { userId: id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: {
        employee: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          department: user.department,
        },
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team attendance summary (Manager)
// @route   GET /api/attendance/summary
// @access  Private (Manager)
export const getTeamSummary = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;

    let query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name employeeId department');

    const summary = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance status for all employees (Manager)
// @route   GET /api/attendance/today-status
// @access  Private (Manager)
export const getTodayStatus = async (req, res, next) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    const todayAttendance = await Attendance.find({ date: today })
      .populate('userId', 'name email employeeId department role');

    const allEmployees = await User.find({ role: 'employee' });

    const presentEmployees = todayAttendance
      .filter((a) => a.status !== 'absent')
      .map((a) => a.userId);

    const absentEmployees = allEmployees.filter(
      (emp) => !presentEmployees.some((p) => p._id.toString() === emp._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        date: today,
        present: presentEmployees.length,
        absent: absentEmployees.length,
        late: todayAttendance.filter((a) => a.status === 'late').length,
        presentEmployees: presentEmployees.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          employeeId: u.employeeId,
          department: u.department,
        })),
        absentEmployees: absentEmployees.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          employeeId: u.employeeId,
          department: u.department,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Export attendance report (Manager)
// @route   GET /api/attendance/export
// @access  Private (Manager)
export const exportAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    let query = {};

    // Filter by date range
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by employee
    if (employeeId && employeeId !== 'all') {
      const user = await User.findOne({ _id: employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Format data for CSV
    const csvData = attendance.map((record) => {
      return {
        EmployeeID: record.userId?.employeeId || 'N/A',
        Name: record.userId?.name || 'N/A',
        Department: record.userId?.department || 'N/A',
        Date: record.date,
        CheckIn: record.checkInTime || '-',
        CheckOut: record.checkOutTime || '-',
        Status: record.status,
        TotalHours: record.totalHours || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: csvData.length,
      data: csvData,
    });
  } catch (error) {
    next(error);
  }
};
