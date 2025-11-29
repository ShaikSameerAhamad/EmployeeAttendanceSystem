import { useState } from 'react';
import { format } from 'date-fns';
import { Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CheckInOutCard from '@/components/dashboard/CheckInOutCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppSelector } from '@/store/hooks';
import { Attendance, AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const AttendancePage = () => {
  const { todayAttendance } = useAppSelector((state) => state.attendance);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Check in and out for today, {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Check In/Out Card */}
          <div className="animate-slide-up">
            <CheckInOutCard />
          </div>

          {/* Today's Details */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  Today's Details
                </CardTitle>
                <CardDescription>
                  Your attendance record for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="text-lg font-semibold font-mono">{user?.employeeId}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="text-lg font-semibold">{user?.department}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <span className="font-medium">{format(new Date(), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check In Time</span>
                      <span className="font-medium">
                        {todayAttendance?.checkInTime || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check Out Time</span>
                      <span className="font-medium">
                        {todayAttendance?.checkOutTime || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Hours</span>
                      <span className="font-medium">
                        {todayAttendance?.totalHours ? `${todayAttendance.totalHours}h` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {todayAttendance ? (
                        <Badge className={cn('font-medium', statusConfig[todayAttendance.status].className)}>
                          {statusConfig[todayAttendance.status].label}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Recorded</Badge>
                      )}
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
                    <h4 className="font-medium text-sm">Office Hours Guidelines</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Regular hours: 9:00 AM - 6:00 PM</li>
                      <li>• Check-in after 9:00 AM is marked as Late</li>
                      <li>• Less than 5 hours is marked as Half Day</li>
                      <li>• Remember to check out before leaving</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
