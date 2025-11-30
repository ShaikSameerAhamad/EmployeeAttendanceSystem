import { useState, useEffect, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { FileText, Download, Filter, BarChart3, Loader2 } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import { managerAttendanceAPI } from '@/services/api';
import { Attendance, User } from '@/types';

const convertToCSV = (rows: Record<string, any>[]) => {
  if (!rows.length) return '';

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value).replace(/"/g, '""');
    return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
  };

  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(',')),
  ];

  return csvRows.join('\n');
};

const triggerDownload = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await managerAttendanceAPI.getTodayStatus();
        if (data.success) {
          const allEmps = [...data.data.presentEmployees, ...data.data.absentEmployees];
          const normalized = allEmps.map((emp) => ({
            ...emp,
            id: emp.id || emp._id || emp.employeeId || emp.email,
          }));
          const uniqueEmps = Array.from(new Map(normalized.map((item) => [item.id, item])).values());
          setEmployees(uniqueEmps as User[]);
        }
      } catch (error) {
        console.error('Failed to fetch employees', error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await managerAttendanceAPI.getAll({
          employeeId: selectedEmployee === 'all' ? undefined : selectedEmployee,
          startDate,
          endDate,
        });

        if (data.success) {
          setAttendanceData(data.data);
        }
      } catch (error) {
        toast({
          title: 'Failed to fetch data',
          description: 'Could not load attendance records.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, selectedEmployee]);

  const summaryStats = useMemo(() => {
    const stats = {
      present: attendanceData.filter((a) => a.status === 'present').length,
      absent: attendanceData.filter((a) => a.status === 'absent').length,
      late: attendanceData.filter((a) => a.status === 'late').length,
      halfDay: attendanceData.filter((a) => a.status === 'half-day').length,
      totalHours: attendanceData.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };
    return stats;
  }, [attendanceData]);

  const chartData = useMemo(() => {
    const dataByEmployee: Record<string, { present: number; absent: number; late: number; halfDay: number }> = {};

    attendanceData.forEach((record) => {
      // record.userId is populated, so it should be an object
      const employee = record.userId as unknown as User;
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
      name: name.split(' ')[0],
      ...stats,
    }));
  }, [attendanceData]);

  const handleExport = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: 'Invalid date range',
        description: 'Start date must be before end date.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const data = await managerAttendanceAPI.exportAttendance(
        startDate,
        endDate,
        selectedEmployee === 'all' ? undefined : selectedEmployee
      );

      if (!data.success) {
        throw new Error('Export failed');
      }

      const records = data.data;
      if (!records.length) {
        toast({
          title: 'No data to export',
          description: 'Try loosening your filters and try again.',
          variant: 'destructive',
        });
        return;
      }

      const csvContent = convertToCSV(records);
      const filename = `attendance-${startDate}-to-${endDate}${
        selectedEmployee !== 'all' ? `-${selectedEmployee}` : ''
      }.csv`;
      triggerDownload(csvContent, filename);

      toast({
        title: 'Report exported',
        description: `${records.length} record${records.length === 1 ? '' : 's'} saved to CSV.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export attendance report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
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
          <Button onClick={handleExport} size="lg" className="w-fit" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Preparing CSV…' : 'Export Report (CSV)'}
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
                    {employees.map((emp) => {
                      const value = emp.employeeId || emp.id;
                      return (
                        <SelectItem key={emp.id} value={value}>
                          {emp.name} ({emp.employeeId || 'N/A'})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="rounded-lg bg-primary/10 px-4 py-2 w-full text-center">
                  <p className="text-sm text-muted-foreground">Records Found</p>
                  <p className="text-2xl font-bold text-primary">{attendanceData.length}</p>
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
                attendance={attendanceData}
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
