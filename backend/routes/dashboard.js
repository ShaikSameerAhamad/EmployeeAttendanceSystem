import express from 'express';
import {
  getEmployeeDashboard,
  getManagerDashboard,
} from '../controllers/dashboardController.js';
import { protect, isEmployee, isManager } from '../middleware/auth.js';

const router = express.Router();

router.get('/employee', protect, isEmployee, getEmployeeDashboard);
router.get('/manager', protect, isManager, getManagerDashboard);

export default router;

