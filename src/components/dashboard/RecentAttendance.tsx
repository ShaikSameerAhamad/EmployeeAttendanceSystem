import { format, parseISO, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Attendance, AttendanceStatus } from '@/types';

interface RecentAttendanceProps {
  attendance: Attendance[];
}

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const RecentAttendance = ({ attendance }: RecentAttendanceProps) => {
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = attendance.find((a) => a.date === dateStr);
    return {
      date,
      dateStr,
      record,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-lg">Recent Attendance (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {last7Days.map(({ date, dateStr, record, isWeekend }) => (
            <div
              key={dateStr}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 transition-colors',
                isWeekend ? 'bg-muted/50' : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 flex-col items-center justify-center rounded-lg',
                    isWeekend ? 'bg-muted' : 'bg-secondary'
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-sm font-bold">{format(date, 'd')}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{format(date, 'MMMM d, yyyy')}</p>
                  {record && (
                    <p className="text-xs text-muted-foreground">
                      {record.checkInTime} - {record.checkOutTime || 'In progress'}
                    </p>
                  )}
                  {isWeekend && (
                    <p className="text-xs text-muted-foreground">Weekend</p>
                  )}
                </div>
              </div>
              {!isWeekend && (
                record ? (
                  <Badge className={cn('font-medium', statusConfig[record.status].className)}>
                    {statusConfig[record.status].label}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    No Record
                  </Badge>
                )
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAttendance;
