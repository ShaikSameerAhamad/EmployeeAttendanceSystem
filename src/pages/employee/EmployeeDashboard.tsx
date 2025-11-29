import { useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import CheckInOutCard from '@/components/dashboard/CheckInOutCard';
import RecentAttendance from '@/components/dashboard/RecentAttendance';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMyHistory, setSummary, setTodayAttendance } from '@/store/slices/attendanceSlice';
import { mockAttendance } from '@/data/mockData';

const EmployeeDashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myHistory, summary, todayAttendance } = useAppSelector((state) => state.attendance);

  useEffect(() => {
    if (user) {
      // Load user's attendance data
      const userAttendance = mockAttendance.filter((a) => a.userId === user.id);
      dispatch(setMyHistory(userAttendance));

      // Check today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = userAttendance.find((a) => a.date === today);
      dispatch(setTodayAttendance(todayRecord || null));

      // Calculate summary for current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthAttendance = userAttendance.filter((a) => {
        const date = new Date(a.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const summaryData = {
        present: monthAttendance.filter((a) => a.status === 'present').length,
        absent: monthAttendance.filter((a) => a.status === 'absent').length,
        late: monthAttendance.filter((a) => a.status === 'late').length,
        halfDay: monthAttendance.filter((a) => a.status === 'half-day').length,
        totalHours: monthAttendance.reduce((sum, a) => sum + a.totalHours, 0),
      };
      dispatch(setSummary(summaryData));
    }
  }, [user, dispatch]);

  const getTodayStatusText = () => {
    if (!todayAttendance) return 'Not checked in';
    if (todayAttendance.checkOutTime) return 'Day completed';
    return 'Checked in';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your attendance overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="Today's Status"
              value={getTodayStatusText()}
              subtitle={todayAttendance?.checkInTime ? `Since ${todayAttendance.checkInTime}` : undefined}
              icon={<Clock className="h-6 w-6" />}
              variant={todayAttendance?.checkInTime ? 'success' : 'default'}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <StatCard
              title="Present Days"
              value={summary.present}
              subtitle="This month"
              icon={<CheckCircle className="h-6 w-6" />}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <StatCard
              title="Late Arrivals"
              value={summary.late}
              subtitle="This month"
              icon={<Calendar className="h-6 w-6" />}
              variant="warning"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <StatCard
              title="Total Hours"
              value={`${summary.totalHours}h`}
              subtitle="This month"
              icon={<TrendingUp className="h-6 w-6" />}
              variant="primary"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <CheckInOutCard />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <RecentAttendance attendance={myHistory} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
