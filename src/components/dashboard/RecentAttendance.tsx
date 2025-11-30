import { format, parseISO, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Attendance, AttendanceStatus } from '@/types';

interface RecentAttendanceProps {
  attendance: Attendance[];
  className?: string;
}

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const RecentAttendance = ({ attendance, className }: RecentAttendanceProps) => {
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
    <Card variant="elevated" className={cn('h-full flex flex-col overflow-hidden glass-effect', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white">Recent Attendance (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-6 pb-6 pt-0">
        <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-purple">
          {last7Days.map(({ date, dateStr, record, isWeekend }) => (
            <div
              key={dateStr}
              className={cn(
                'flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-200',
                isWeekend ? 'opacity-80' : 'hover:border-white/20 hover:bg-white/10'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white',
                    isWeekend && 'opacity-70'
                  )}
                >
                  <span className="text-[11px] font-medium uppercase tracking-wide text-white/70">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {format(date, 'd')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{format(date, 'MMMM d, yyyy')}</p>
                  {record ? (
                    <p className="text-xs text-white/60">
                      {record.checkInTime} - {record.checkOutTime || 'In progress'}
                    </p>
                  ) : (
                    <p className="text-xs text-white/50">No record available</p>
                  )}
                  {isWeekend && (
                    <p className="text-xs text-white/50">Weekend</p>
                  )}
                </div>
              </div>
              {!isWeekend && (
                record ? (
                  <Badge className={cn('font-medium px-3 py-1 text-xs', statusConfig[record.status].className)}>
                    {statusConfig[record.status].label}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-3 py-1 text-xs text-white/60 border-white/20">
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
