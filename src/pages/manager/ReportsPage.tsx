import { useState, useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { FileText, Download, Filter, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers, mockAttendance } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const employees = mockUsers.filter((u) => u.role === 'employee');

  const filteredData = useMemo(() => {
    let filtered = mockAttendance.filter((a) => {
      const date = parseISO(a.date);
      return date >= parseISO(startDate) && date <= parseISO(endDate);
    });

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter((a) => a.userId === selectedEmployee);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [startDate, endDate, selectedEmployee]);

  const summaryStats = useMemo(() => {
    const stats = {
      present: filteredData.filter((a) => a.status === 'present').length,
      absent: filteredData.filter((a) => a.status === 'absent').length,
      late: filteredData.filter((a) => a.status === 'late').length,
      halfDay: filteredData.filter((a) => a.status === 'half-day').length,
      totalHours: filteredData.reduce((sum, a) => sum + a.totalHours, 0),
    };
    return stats;
  }, [filteredData]);

  const chartData = useMemo(() => {
    const dataByEmployee: Record<string, { present: number; absent: number; late: number; halfDay: number }> = {};

    filteredData.forEach((record) => {
      const employee = employees.find((e) => e.id === record.userId);
      const name = employee?.name || 'Unknown';

      if (!dataByEmployee[name]) {
        dataByEmployee[name] = { present: 0, absent: 0, late: 0, halfDay: 0 };
      }

      if (record.status === 'present') dataByEmployee[name].present++;
      else if (record.status === 'absent') dataByEmployee[name].absent++;
      else if (record.status === 'late') dataByEmployee[name].late++;
      else if (record.status === 'half-day') dataByEmployee[name].halfDay++;
    });

    return Object.entries(dataByEmployee).map(([name, stats]) => ({
      name: name.split(' ')[0], // First name only for chart
      ...stats,
    }));
  }, [filteredData, employees]);

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'No data to export',
        description: 'Please adjust your filters to include some records.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Status'];
    const rows = filteredData.map((record) => {
      const user = employees.find((u) => u.id === record.userId);
      return [
        user?.employeeId || '-',
        user?.name || '-',
        user?.department || '-',
        record.date,
        record.checkInTime || '-',
        record.checkOutTime || '-',
        record.totalHours.toString(),
        record.status,
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Report exported successfully',
      description: `${filteredData.length} records exported to CSV.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate and export detailed attendance reports
            </p>
          </div>
          <Button onClick={exportToCSV} size="lg" className="w-fit">
            <Download className="h-4 w-4 mr-2" />
            Export Report (CSV)
          </Button>
        </div>

        {/* Filters */}
        <Card variant="glass" className="animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Select date range and employee to generate reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="rounded-lg bg-primary/10 px-4 py-2 w-full text-center">
                  <p className="text-sm text-muted-foreground">Records Found</p>
                  <p className="text-2xl font-bold text-primary">{filteredData.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card variant="stat" className="border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-3xl font-bold text-success">{summaryStats.present}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-3xl font-bold text-destructive">{summaryStats.absent}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-late/30 bg-late/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-3xl font-bold text-late">{summaryStats.late}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-halfday/30 bg-halfday/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Half Days</p>
              <p className="text-3xl font-bold text-halfday">{summaryStats.halfDay}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold text-primary">{summaryStats.totalHours}h</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {selectedEmployee === 'all' && chartData.length > 0 && (
          <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Attendance by Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
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
                    <Bar dataKey="halfDay" name="Half Day" fill="hsl(var(--halfday))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" name="Absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Detailed Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceTable
                attendance={filteredData}
                users={employees}
                showUser={selectedEmployee === 'all'}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
