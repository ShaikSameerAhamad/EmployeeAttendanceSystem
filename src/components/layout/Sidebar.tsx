import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { clearAttendance } from '@/store/slices/attendanceSlice';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  FileText,
  User,
  LogOut,
  CheckCircle,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearAttendance());
  };

  const employeeLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/attendance', icon: Clock, label: 'Mark Attendance' },
    { to: '/history', icon: CalendarDays, label: 'My History' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const managerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'All Employees' },
    { to: '/calendar', icon: CalendarDays, label: 'Team Calendar' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <CheckCircle className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">AttendEase</h1>
            <p className="text-xs text-sidebar-foreground/60">Attendance System</p>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
