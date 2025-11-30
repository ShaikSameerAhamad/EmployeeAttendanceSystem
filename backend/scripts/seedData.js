import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Cleared existing data...');

    // Create users with explicit employeeIds
    const userData = [
      {
        name: 'John Smith',
        email: 'john@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering',
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        password: 'password123',
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Engineering',
      },
      {
        name: 'Mike Wilson',
        email: 'mike@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Design',
      },
      {
        name: 'Emily Davis',
        email: 'emily@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Marketing',
      },
      {
        name: 'David Brown',
        email: 'david@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Engineering',
      },
    ];

    const createdUsers = [];
    for (const userInfo of userData) {
      const user = new User(userInfo);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Generate attendance data for the last 2 months
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const attendanceRecords = [];

    for (const user of createdUsers) {
      // Generate for current month and previous month
      for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
        const targetDate = new Date(currentYear, currentMonth - monthOffset, 1);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        for (const day of days) {
          // Skip weekends
          if (day.getDay() === 0 || day.getDay() === 6) continue;
          
          // Skip future dates
          if (day > now) continue;

          const dateStr = format(day, 'yyyy-MM-dd');
          
          // Random status (80% present, 10% late, 5% half-day, 5% absent)
          const rand = Math.random();
          let status, checkInTime, checkOutTime, totalHours;

          if (rand < 0.05) {
            // Absent
            status = 'absent';
            checkInTime = null;
            checkOutTime = null;
            totalHours = 0;
          } else if (rand < 0.15) {
            // Late
            status = 'late';
            const checkInHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM
            const checkInMin = Math.floor(Math.random() * 60);
            checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`;
            
            const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
            const checkOutMin = Math.floor(Math.random() * 60);
            checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`;
            totalHours = checkOutHour - checkInHour;
          } else if (rand < 0.20) {
            // Half day
            status = 'half-day';
            const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
            const checkInMin = Math.floor(Math.random() * 60);
            checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`;
            
            const checkOutHour = 12 + Math.floor(Math.random() * 2); // 12-1 PM
            const checkOutMin = Math.floor(Math.random() * 60);
            checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`;
            totalHours = checkOutHour - checkInHour;
          } else {
            // Present
            status = 'present';
            const checkInHour = 8 + Math.floor(Math.random() * 1); // 8-9 AM
            const checkInMin = Math.floor(Math.random() * 60);
            checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`;
            
            const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
            const checkOutMin = Math.floor(Math.random() * 60);
            checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`;
            totalHours = checkOutHour - checkInHour;
          }

          attendanceRecords.push({
            userId: user._id,
            date: dateStr,
            checkInTime,
            checkOutTime,
            status,
            totalHours,
            createdAt: day,
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Employee: john@company.com / password123');
    console.log('Manager: sarah@company.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

