import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get today's attendance
    const todayAttendance = await Attendance.findOne({
      userId,
      date: today,
    });

    // Get current month summary
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    const monthAttendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const monthSummary = {
      present: monthAttendance.filter((a) => a.status === 'present').length,
      absent: monthAttendance.filter((a) => a.status === 'absent').length,
      late: monthAttendance.filter((a) => a.status === 'late').length,
      halfDay: monthAttendance.filter((a) => a.status === 'half-day').length,
      totalHours: monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    // Get recent attendance (last 7 days)
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const recentAttendance = await Attendance.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    })
      .sort({ date: -1 })
      .limit(7);

    res.status(200).json({
      success: true,
      data: {
        todayStatus: todayAttendance?.status || null,
        isCheckedIn: !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime,
        checkInTime: todayAttendance?.checkInTime || null,
        monthSummary,
        recentAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
export const getManagerDashboard = async (req, res, next) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get all employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Get today's attendance
    const todayAttendance = await Attendance.find({ date: today })
      .populate('userId', 'name email employeeId department');

    const presentToday = todayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late' || a.status === 'half-day'
    ).length;

    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter((a) => a.status === 'late').length;

    // Get absent employees
    const presentUserIds = todayAttendance.map((a) => a.userId._id.toString());
    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: presentUserIds },
    }).select('name email employeeId department');

    // Weekly trend (last 7 days)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyTrend = await Promise.all(
      weekDays.map(async (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayAttendance = await Attendance.find({ date: dayStr });

        return {
          day: format(day, 'EEE'),
          date: dayStr,
          present: dayAttendance.filter((a) => a.status === 'present').length,
          late: dayAttendance.filter((a) => a.status === 'late').length,
          absent: totalEmployees - dayAttendance.filter((a) => a.status !== 'absent').length,
        };
      })
    );

    // Department-wise stats
    const departments = await User.distinct('department', { role: 'employee' });
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptEmployees = await User.find({ department: dept, role: 'employee' });
        const deptEmployeeIds = deptEmployees.map((e) => e._id);
        const deptTodayAttendance = todayAttendance.filter((a) =>
          deptEmployeeIds.includes(a.userId._id)
        );
        const deptPresent = deptTodayAttendance.filter(
          (a) => a.status !== 'absent'
        ).length;

        return {
          department: dept,
          present: deptPresent,
          total: deptEmployees.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        weeklyTrend,
        departmentStats,
        absentEmployees: absentEmployees.map((e) => ({
          id: e._id,
          name: e.name,
          email: e.email,
          employeeId: e.employeeId,
          department: e.department,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

