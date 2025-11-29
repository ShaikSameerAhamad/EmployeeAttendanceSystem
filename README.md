# AttendEase - Employee Attendance System

A modern, full-featured employee attendance tracking system built with React + Redux Toolkit. This application provides comprehensive attendance management for both employees and managers with an intuitive, beautiful UI.

![AttendEase](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.0-764ABC.svg)

## 🖼️ Screenshots

### Login Page
- Clean, modern authentication interface
- Support for both login and registration
- Role-based access (Employee/Manager)

### Employee Dashboard
- Quick check-in/check-out functionality
- Monthly attendance summary
- Recent attendance history
- Real-time clock display

### Manager Dashboard
- Team attendance overview
- Weekly trend charts
- Department-wise statistics
- Absent employees list

## ✨ Features

### Employee Features
- ✅ Register/Login with role selection
- ✅ Mark attendance (Check In / Check Out)
- ✅ View attendance history (Calendar & Table views)
- ✅ View monthly summary (Present/Absent/Late/Half-day)
- ✅ Dashboard with personal stats
- ✅ Profile management

### Manager Features
- ✅ Login with manager credentials
- ✅ View all employees' attendance
- ✅ Filter by employee, date, status
- ✅ Team attendance summary with charts
- ✅ Export attendance reports (CSV)
- ✅ Dashboard with team stats
- ✅ Team calendar view

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3
- **State Management**: Redux Toolkit
- **Type Safety**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (customized)
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Form Validation**: Zod
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/
│   ├── attendance/        # Attendance-related components
│   │   ├── AttendanceCalendar.tsx
│   │   └── AttendanceTable.tsx
│   ├── dashboard/         # Dashboard components
│   │   ├── CheckInOutCard.tsx
│   │   ├── RecentAttendance.tsx
│   │   └── StatCard.tsx
│   ├── layout/            # Layout components
│   │   ├── DashboardLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/                # shadcn/ui components
├── data/
│   └── mockData.ts        # Sample data for demo
├── pages/
│   ├── employee/          # Employee pages
│   │   ├── AttendancePage.tsx
│   │   ├── EmployeeDashboard.tsx
│   │   └── HistoryPage.tsx
│   ├── manager/           # Manager pages
│   │   ├── AllEmployeesPage.tsx
│   │   ├── ManagerDashboard.tsx
│   │   ├── ReportsPage.tsx
│   │   └── TeamCalendarPage.tsx
│   ├── Auth.tsx
│   └── ProfilePage.tsx
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── attendanceSlice.ts
│   ├── hooks.ts
│   └── index.ts
├── types/
│   └── index.ts
└── App.tsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## 🔐 Demo Credentials

### Employee Login
- **Email**: john@company.com
- **Password**: password123

### Manager Login
- **Email**: sarah@company.com
- **Password**: password123

## 📊 Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Full name |
| email | string | Email address |
| role | enum | 'employee' \| 'manager' |
| employeeId | string | Unique employee ID (e.g., EMP001) |
| department | string | Department name |
| createdAt | string | Account creation date |

### Attendance
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| userId | string | Reference to user |
| date | string | Attendance date |
| checkInTime | string \| null | Check-in time |
| checkOutTime | string \| null | Check-out time |
| status | enum | 'present' \| 'absent' \| 'late' \| 'half-day' |
| totalHours | number | Hours worked |
| createdAt | string | Record creation date |

## 🎨 Status Color Codes

| Status | Color | Condition |
|--------|-------|-----------|
| Present | 🟢 Green | Checked in before 9 AM |
| Late | 🟡 Yellow | Checked in after 9 AM |
| Half Day | 🟠 Orange | Worked less than 5 hours |
| Absent | 🔴 Red | No attendance record |

## 📱 Pages Overview

### Employee Pages
- `/dashboard` - Personal attendance dashboard
- `/attendance` - Mark check-in/check-out
- `/history` - View attendance history with calendar
- `/profile` - View profile information

### Manager Pages
- `/dashboard` - Team overview with charts
- `/employees` - All employees attendance with filters
- `/calendar` - Team calendar view
- `/reports` - Generate and export reports

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# No environment variables required for the current frontend-only version
# Backend integration will require:
# VITE_API_URL=your_api_url
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 API Endpoints (For Backend Integration)

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - My attendance
- `GET /api/attendance/my-summary` - Monthly summary
- `GET /api/attendance/today` - Today's status

### Attendance (Manager)
- `GET /api/attendance/all` - All employees
- `GET /api/attendance/employee/:id` - Specific employee
- `GET /api/attendance/summary` - Team summary
- `GET /api/attendance/export` - Export CSV
- `GET /api/attendance/today-status` - Who's present today

### Dashboard
- `GET /api/dashboard/employee` - Employee stats
- `GET /api/dashboard/manager` - Manager stats

## 🚀 Deployment

The application can be deployed using Lovable's built-in deployment:

1. Click **Share** → **Publish** in the Lovable editor
2. Your app will be deployed to a `.lovable.app` domain

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is built with Lovable.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Recharts](https://recharts.org/) - Charting library
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
