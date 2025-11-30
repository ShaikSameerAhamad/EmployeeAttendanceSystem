import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarDays, List, Download } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyHistory, fetchSummary } from '@/store/slices/attendanceSlice';
import { Attendance, AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const HistoryPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myHistory, summary } = useAppSelector((state) => state.attendance);
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<{ date: Date; record?: Attendance } | null>(null);

  const selectedMonthDate = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedMonth, selectedYear]
  );

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => today.getFullYear() - index),
    [today]
  );

  useEffect(() => {
    if (user) {
      const payload = { month: selectedMonth + 1, year: selectedYear };
      dispatch(fetchMyHistory(payload));
      dispatch(fetchSummary(payload));
    }
  }, [user, dispatch, selectedMonth, selectedYear]);

  const handleDateClick = (date: Date, record?: Attendance) => {
    setSelectedDay({ date, record });
  };

  const handleMonthSelect = (value: string) => {
    setSelectedMonth(Number(value));
  };

  const handleYearSelect = (value: string) => {
    setSelectedYear(Number(value));
  };

  const handleResetMonth = () => {
    const current = new Date();
    setSelectedMonth(current.getMonth());
    setSelectedYear(current.getFullYear());
  };

  const sortedHistory = useMemo(() => {
    return [...myHistory].sort((a, b) => a.date.localeCompare(b.date));
  }, [myHistory]);

  const exportToCSV = () => {
    const headers = ['Date', 'Check In', 'Check Out', 'Total Hours', 'Status'];
    const rows = sortedHistory.map((record) => [
      record.date,
      record.checkInTime || '-',
      record.checkOutTime || '-',
      (record.totalHours ?? 0).toString(),
      record.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance History</h1>
            <p className="text-muted-foreground mt-1">
              View your complete attendance records
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="w-fit">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Month Filters */}
        <Card variant="glass" className="animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Select Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Select value={selectedMonth.toString()} onValueChange={handleMonthSelect}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((monthName, index) => (
                      <SelectItem key={monthName} value={index.toString()}>
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={handleYearSelect}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full md:w-auto" onClick={handleResetMonth}>
                Go to current month
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-slide-up">
          <Card variant="stat" className="border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-3xl font-bold text-success">{summary.present}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-3xl font-bold text-destructive">{summary.absent}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-late/30 bg-late/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-3xl font-bold text-late">{summary.late}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-halfday/30 bg-halfday/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Half Days</p>
              <p className="text-3xl font-bold text-halfday">{summary.halfDay}</p>
            </CardContent>
          </Card>
          <Card variant="stat" className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold text-primary">{summary.totalHours}h</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar & Table View */}
        <Tabs defaultValue="calendar" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <List className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <AttendanceCalendar
              attendance={sortedHistory}
              onDateClick={handleDateClick}
              month={selectedMonthDate}
              onMonthChange={(nextMonth) => {
                setSelectedMonth(nextMonth.getMonth());
                setSelectedYear(nextMonth.getFullYear());
              }}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <AttendanceTable attendance={sortedHistory} />
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
            </DialogHeader>
            {selectedDay && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    {selectedDay.record ? (
                      <Badge className={cn('mt-1', statusConfig[selectedDay.record.status].className)}>
                        {statusConfig[selectedDay.record.status].label}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1 text-muted-foreground">
                        No record
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedDay.record ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Check In</p>
                      <p className="font-medium">{selectedDay.record.checkInTime || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Check Out</p>
                      <p className="font-medium">{selectedDay.record.checkOutTime || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Total Hours</p>
                      <p className="font-medium">{selectedDay.record.totalHours ?? 0}h</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No attendance data was recorded for this day.
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
