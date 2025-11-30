import express from 'express';
import {
  checkIn,
  checkOut,
  getMyHistory,
  getMySummary,
  getToday,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  getTodayStatus,
  exportAttendance,
} from '../controllers/attendanceController.js';
import { protect, isEmployee, isManager } from '../middleware/auth.js';

const router = express.Router();

// Employee routes
router.post('/checkin', protect, isEmployee, checkIn);
router.post('/checkout', protect, isEmployee, checkOut);
router.get('/my-history', protect, isEmployee, getMyHistory);
router.get('/my-summary', protect, isEmployee, getMySummary);
router.get('/today', protect, isEmployee, getToday);

// Manager routes
router.get('/all', protect, isManager, getAllAttendance);
router.get('/employee/:id', protect, isManager, getEmployeeAttendance);
router.get('/summary', protect, isManager, getTeamSummary);
router.get('/export', protect, isManager, exportAttendance);
router.get('/today-status', protect, isManager, getTodayStatus);

export default router;

