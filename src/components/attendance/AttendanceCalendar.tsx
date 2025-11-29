import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWeekend,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Attendance, AttendanceStatus } from '@/types';

interface AttendanceCalendarProps {
  attendance: Attendance[];
  onDateClick?: (date: Date, record?: Attendance) => void;
}

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-success text-success-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  late: 'bg-late text-late-foreground',
  'half-day': 'bg-halfday text-halfday-foreground',
};

const AttendanceCalendar = ({ attendance, onDateClick }: AttendanceCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for the first week
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find((a) => a.date === dateStr);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
            const isFuture = day > new Date();

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick?.(day, record)}
                disabled={isFuture || isWeekendDay}
                className={cn(
                  'aspect-square rounded-lg p-1 text-sm transition-all duration-200',
                  'hover:scale-105 hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isToday && 'ring-2 ring-primary ring-offset-2',
                  isWeekendDay && 'bg-muted/50 cursor-not-allowed',
                  isFuture && 'opacity-50 cursor-not-allowed',
                  record && statusColors[record.status],
                  !record && !isWeekendDay && !isFuture && 'bg-secondary hover:bg-secondary/80'
                )}
              >
                <span className="font-medium">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
