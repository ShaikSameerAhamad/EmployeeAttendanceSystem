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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 text-sidebar-foreground border-r border-sidebar-border shadow-2xl backdrop-blur-xl" style={{ background: 'linear-gradient(180deg, #0B0910 0%, #1a1330 100%)' }}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border/30 px-6" style={{ background: 'linear-gradient(135deg, rgba(174, 99, 240, 0.12) 0%, rgba(98, 51, 154, 0.06) 100%)' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary-purple shadow-lg purple-glow">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">AttendEase</h1>
            <p className="text-xs text-white/70 font-medium">Attendance System</p>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border/30 p-4" style={{ background: 'linear-gradient(135deg, rgba(174, 99, 240, 0.1) 0%, rgba(98, 51, 154, 0.05) 100%)' }}>
          <div className="flex items-center gap-3 rounded-xl backdrop-blur-sm p-3 border border-sidebar-border/30 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(174, 99, 240, 0.18) 0%, rgba(98, 51, 154, 0.12) 100%)' }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary-purple text-white font-semibold text-sm shadow-lg purple-glow-subtle">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-white/70 capitalize font-medium">{user?.role} • {user?.employeeId}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 group',
                  isActive
                    ? 'gradient-primary-purple text-white shadow-lg purple-glow scale-[1.02]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                )}
              >
                <link.icon className={cn(
                  'h-5 w-5 transition-transform duration-300',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border/30 p-4" style={{ background: 'linear-gradient(135deg, rgba(174, 99, 240, 0.1) 0%, rgba(98, 51, 154, 0.05) 100%)' }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:bg-destructive/20 hover:text-destructive hover:translate-x-1 group"
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
