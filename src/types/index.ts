export type UserRole = 'employee' | 'manager';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  totalHours: number;
  createdAt: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  totalHours: number;
}

export interface DashboardStats {
  todayStatus: AttendanceStatus | null;
  isCheckedIn: boolean;
  checkInTime: string | null;
  monthSummary: AttendanceSummary;
  recentAttendance: Attendance[];
}

export interface ManagerDashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  weeklyTrend: { day: string; present: number; absent: number; late: number }[];
  departmentStats: { department: string; present: number; total: number }[];
  absentEmployees: User[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AttendanceState {
  todayAttendance: Attendance | null;
  myHistory: Attendance[];
  allAttendance: Attendance[];
  summary: AttendanceSummary;
  isLoading: boolean;
  error: string | null;
}
