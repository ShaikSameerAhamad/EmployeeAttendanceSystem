import { useState, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMyHistory, setSummary } from '@/store/slices/attendanceSlice';
import { mockAttendance } from '@/data/mockData';
import { Attendance, AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const HistoryPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myHistory, summary } = useAppSelector((state) => state.attendance);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);

  useEffect(() => {
    if (user) {
      const userAttendance = mockAttendance
        .filter((a) => a.userId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      dispatch(setMyHistory(userAttendance));

      // Calculate summary
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthAttendance = userAttendance.filter((a) => {
        const date = new Date(a.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      dispatch(setSummary({
        present: monthAttendance.filter((a) => a.status === 'present').length,
        absent: monthAttendance.filter((a) => a.status === 'absent').length,
        late: monthAttendance.filter((a) => a.status === 'late').length,
        halfDay: monthAttendance.filter((a) => a.status === 'half-day').length,
        totalHours: monthAttendance.reduce((sum, a) => sum + a.totalHours, 0),
      }));
    }
  }, [user, dispatch]);

  const handleDateClick = (date: Date, record?: Attendance) => {
    if (record) {
      setSelectedRecord(record);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Check In', 'Check Out', 'Total Hours', 'Status'];
    const rows = myHistory.map((record) => [
      record.date,
      record.checkInTime || '-',
      record.checkOutTime || '-',
      record.totalHours.toString(),
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

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
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
              attendance={myHistory}
              onDateClick={handleDateClick}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <AttendanceTable attendance={myHistory} />
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedRecord.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={cn('mt-1', statusConfig[selectedRecord.status].className)}>
                      {statusConfig[selectedRecord.status].label}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Check In</p>
                    <p className="font-medium">{selectedRecord.checkInTime || '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Check Out</p>
                    <p className="font-medium">{selectedRecord.checkOutTime || '-'}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                    <p className="font-medium">{selectedRecord.totalHours}h</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
