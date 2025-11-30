import { useEffect, useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWeekend,
  isAfter,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Attendance, AttendanceStatus } from '@/types';

interface AttendanceCalendarProps {
  attendance: Attendance[];
  onDateClick?: (date: Date, record?: Attendance) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-success text-success-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  late: 'bg-late text-late-foreground',
  'half-day': 'bg-halfday text-halfday-foreground',
};

const AttendanceCalendar = ({ attendance, onDateClick, month, onMonthChange }: AttendanceCalendarProps) => {
  const [internalMonth, setInternalMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (month) {
      setInternalMonth(startOfMonth(month));
    }
  }, [month]);

  const currentMonth = month ? startOfMonth(month) : internalMonth;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for the first week
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const attendanceByDate = useMemo(() => {
    const map = new Map<string, Attendance>();
    attendance.forEach((record) => {
      if (record?.date) {
        map.set(record.date, record);
      }
    });
    return map;
  }, [attendance]);

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceByDate.get(dateStr);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMonthShift = (direction: 'prev' | 'next') => {
    const nextMonth = direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);

    if (!month) {
      setInternalMonth(nextMonth);
    }

    onMonthChange?.(nextMonth);
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthShift('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthShift('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn('h-3 w-3 rounded-full', color)} />
              <span className="text-xs capitalize text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week Headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Padding Days */}
          {paddingDays.map((_, i) => (
            <div key={`padding-${i}`} className="aspect-square" />
          ))}

          {/* Calendar Days */}
          {days.map((day) => {
            const record = getAttendanceForDate(day);
            const isToday = isSameDay(day, new Date());
            const isWeekendDay = isWeekend(day);
            const isFuture = isAfter(day, new Date());
            const dateLabel = format(day, 'MMMM d, yyyy');

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isFuture && onDateClick?.(day, record)}
                disabled={isFuture}
                title={record ? `${record.status.toUpperCase()} • ${dateLabel}` : `No record • ${dateLabel}`}
                className={cn(
                  'aspect-square rounded-lg p-1 text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1',
                  'hover:scale-105 hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-[#AE63F0] focus:ring-offset-2 focus:ring-offset-background',
                  isToday && 'ring-2 ring-[#AE63F0] ring-offset-2 ring-offset-background',
                  isWeekendDay && 'bg-muted/40',
                  isFuture && 'opacity-40 cursor-not-allowed',
                  record && statusColors[record.status],
                  !record && !isFuture && 'bg-secondary/40 hover:bg-secondary/60'
                )}
              >
                <span className="font-medium leading-none">{format(day, 'd')}</span>
                {record && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {record.status.replace('-', ' ')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
