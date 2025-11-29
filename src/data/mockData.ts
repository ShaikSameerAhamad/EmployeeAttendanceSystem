import { User, Attendance, AttendanceStatus } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'employee',
    employeeId: 'EMP001',
    department: 'Engineering',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'manager',
    employeeId: 'MGR001',
    department: 'Engineering',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@company.com',
    role: 'employee',
    employeeId: 'EMP002',
    department: 'Design',
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@company.com',
    role: 'employee',
    employeeId: 'EMP003',
    department: 'Marketing',
    createdAt: '2024-02-15',
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@company.com',
    role: 'employee',
    employeeId: 'EMP004',
    department: 'Engineering',
    createdAt: '2024-03-01',
  },
];

const generateAttendanceForMonth = (userId: string, year: number, month: number): Attendance[] => {
  const attendance: Attendance[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'present', 'present', 'late', 'half-day', 'absent'];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    // Skip future dates
    if (date > new Date()) continue;
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isLate = status === 'late';
    const checkInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 1);
    const checkInMinute = Math.floor(Math.random() * 60);
    const checkOutHour = status === 'half-day' ? 13 : 17 + Math.floor(Math.random() * 2);
    const checkOutMinute = Math.floor(Math.random() * 60);
    
    const checkInTime = status !== 'absent' ? `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}` : null;
    const checkOutTime = status !== 'absent' ? `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}` : null;
    
    const totalHours = status === 'absent' ? 0 : status === 'half-day' ? 4 : checkOutHour - checkInHour;
    
    attendance.push({
      id: `${userId}-${year}-${month}-${day}`,
      userId,
      date: date.toISOString().split('T')[0],
      checkInTime,
      checkOutTime,
      status,
      totalHours,
      createdAt: date.toISOString(),
    });
  }
  
  return attendance;
};

export const generateMockAttendance = (): Attendance[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  let allAttendance: Attendance[] = [];
  
  mockUsers.forEach(user => {
    // Generate for current month and previous month
    allAttendance = [
      ...allAttendance,
      ...generateAttendanceForMonth(user.id, currentYear, currentMonth),
      ...generateAttendanceForMonth(user.id, currentYear, currentMonth - 1),
    ];
  });
  
  return allAttendance;
};

export const mockAttendance = generateMockAttendance();
