import { useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import CheckInOutCard from '@/components/dashboard/CheckInOutCard';
import RecentAttendance from '@/components/dashboard/RecentAttendance';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyHistory, fetchSummary, fetchTodayAttendance } from '@/store/slices/attendanceSlice';

const EmployeeDashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myHistory, summary, todayAttendance, isLoading } = useAppSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchTodayAttendance());
    dispatch(fetchMyHistory({}));
    dispatch(fetchSummary({}));
  }, [dispatch]);

  const getTodayStatusText = () => {
    if (!todayAttendance) return 'Not checked in';
    if (todayAttendance.checkOutTime) return 'Day completed';
    return 'Checked in';
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg text-white/70">
              Here's your attendance overview for {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-fade-in h-full" style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="Today's Status"
              value={getTodayStatusText()}
              subtitle={todayAttendance?.checkInTime ? `Since ${todayAttendance.checkInTime}` : undefined}
              icon={<Clock className="h-6 w-6" />}
              variant={todayAttendance?.checkInTime ? 'success' : 'default'}
              className="h-full"
            />
          </div>
          <div className="animate-fade-in h-full" style={{ animationDelay: '0.2s' }}>
            <StatCard
              title="Present Days"
              value={summary.present}
              subtitle="This month"
              icon={<CheckCircle className="h-6 w-6" />}
              variant="success"
              className="h-full"
            />
          </div>
          <div className="animate-fade-in h-full" style={{ animationDelay: '0.3s' }}>
            <StatCard
              title="Late Arrivals"
              value={summary.late}
              subtitle="This month"
              icon={<Calendar className="h-6 w-6" />}
              variant="warning"
              className="h-full"
            />
          </div>
          <div className="animate-fade-in h-full" style={{ animationDelay: '0.4s' }}>
            <StatCard
              title="Total Hours"
              value={`${summary.totalHours}h`}
              subtitle="This month"
              icon={<TrendingUp className="h-6 w-6" />}
              variant="primary"
              className="h-full"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="animate-fade-in xl:col-span-5 2xl:col-span-4" style={{ animationDelay: '0.5s' }}>
            <CheckInOutCard className="h-full" />
          </div>
          <div className="animate-fade-in xl:col-span-7 2xl:col-span-8" style={{ animationDelay: '0.6s' }}>
            <RecentAttendance attendance={myHistory} className="h-full" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
