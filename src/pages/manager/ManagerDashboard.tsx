import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockUsers, mockAttendance } from '@/data/mockData';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [absentToday, setAbsentToday] = useState<typeof mockUsers>([]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const employees = mockUsers.filter((u) => u.role === 'employee');
    const todayAttendance = mockAttendance.filter((a) => a.date === today);

    // Calculate stats
    const presentCount = todayAttendance.filter((a) => 
      a.status === 'present' || a.status === 'late' || a.status === 'half-day'
    ).length;
    const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
    const absentCount = employees.length - presentCount;

    setStats({
      totalEmployees: employees.length,
      presentToday: presentCount,
      absentToday: absentCount,
      lateToday: lateCount,
    });

    // Get absent employees
    const presentUserIds = todayAttendance.map((a) => a.userId);
    const absentEmployees = employees.filter((e) => !presentUserIds.includes(e.id));
    setAbsentToday(absentEmployees);

    // Weekly trend (mock data)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    setWeeklyTrend(
      weekDays.map((day) => ({
        day,
        present: Math.floor(Math.random() * 3) + 2,
        late: Math.floor(Math.random() * 2),
        absent: Math.floor(Math.random() * 2),
      }))
    );

    // Department stats
    const departments = [...new Set(employees.map((e) => e.department))];
    setDepartmentStats(
      departments.map((dept) => {
        const deptEmployees = employees.filter((e) => e.department === dept);
        const deptPresent = todayAttendance.filter(
          (a) => deptEmployees.some((e) => e.id === a.userId) && a.status !== 'absent'
        ).length;
        return {
          name: dept,
          present: deptPresent,
          total: deptEmployees.length,
          value: deptPresent,
        };
      })
    );
  }, []);

  const COLORS = ['hsl(221, 83%, 53%)', 'hsl(174, 62%, 47%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Team attendance overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={<Users className="h-6 w-6" />}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <StatCard
              title="Present Today"
              value={stats.presentToday}
              icon={<UserCheck className="h-6 w-6" />}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <StatCard
              title="Absent Today"
              value={stats.absentToday}
              icon={<UserX className="h-6 w-6" />}
              variant="destructive"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <StatCard
              title="Late Arrivals"
              value={stats.lateToday}
              icon={<Clock className="h-6 w-6" />}
              variant="warning"
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Trend Chart */}
          <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="present" name="Present" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="late" name="Late" fill="hsl(var(--late))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" name="Absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department Stats */}
          <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Department Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Absent Employees List */}
        <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserX className="h-5 w-5 text-destructive" />
              Absent Employees Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {absentToday.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-2 text-success" />
                <p>All employees are present today!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {absentToday.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive font-semibold">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {employee.employeeId}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
