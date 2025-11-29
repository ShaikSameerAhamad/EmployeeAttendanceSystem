import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isWeekend,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockUsers, mockAttendance } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/types';

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-success',
  absent: 'bg-destructive',
  late: 'bg-late',
  'half-day': 'bg-halfday',
};

const TeamCalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const employees = mockUsers.filter((u) => u.role === 'employee');
  const departments = [...new Set(employees.map((e) => e.department))];

  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === 'all') return employees;
    return employees.filter((e) => e.department === selectedDepartment);
  }, [selectedDepartment, employees]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getAttendanceForDate = (date: Date, userId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mockAttendance.find((a) => a.date === dateStr && a.userId === userId);
  };

  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAttendance = mockAttendance.filter(
      (a) => a.date === dateStr && filteredEmployees.some((e) => e.id === a.userId)
    );

    return {
      present: dayAttendance.filter((a) => a.status === 'present').length,
      absent: filteredEmployees.length - dayAttendance.filter((a) => a.status !== 'absent').length,
      late: dayAttendance.filter((a) => a.status === 'late').length,
      halfDay: dayAttendance.filter((a) => a.status === 'half-day').length,
    };
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateData = useMemo(() => {
    if (!selectedDate) return null;

    return filteredEmployees.map((employee) => {
      const attendance = mockAttendance.find(
        (a) => a.date === selectedDate && a.userId === employee.id
      );
      return {
        employee,
        attendance,
      };
    });
  }, [selectedDate, filteredEmployees]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Calendar View</h1>
            <p className="text-muted-foreground mt-1">
              Overview of team attendance by date
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
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
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-late" />
                <span className="text-sm text-muted-foreground">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-halfday" />
                <span className="text-sm text-muted-foreground">Half Day</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week Headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
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
                const isWeekendDay = isWeekend(day);
                const isFuture = day > new Date();
                const stats = getDayStats(day);
                const dateStr = format(day, 'yyyy-MM-dd');

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isWeekendDay && !isFuture && setSelectedDate(dateStr)}
                    disabled={isWeekendDay || isFuture}
                    className={cn(
                      'aspect-square rounded-lg p-2 text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1',
                      'hover:scale-105 hover:shadow-md',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isWeekendDay && 'bg-muted/50 cursor-not-allowed',
                      isFuture && 'opacity-50 cursor-not-allowed',
                      !isWeekendDay && !isFuture && 'bg-card border hover:border-primary'
                    )}
                  >
                    <span className="font-semibold">{format(day, 'd')}</span>
                    {!isWeekendDay && !isFuture && (
                      <div className="flex gap-0.5">
                        {stats.present > 0 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        )}
                        {stats.late > 0 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-late" />
                        )}
                        {stats.absent > 0 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Date Detail Dialog */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Attendance for {selectedDate && format(new Date(selectedDate), 'MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {selectedDateData?.map(({ employee, attendance }) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.employeeId} • {employee.department}
                      </p>
                    </div>
                  </div>
                  {attendance ? (
                    <div className="text-right">
                      <Badge
                        className={cn(
                          'capitalize',
                          statusColors[attendance.status],
                          attendance.status === 'late' ? 'text-late-foreground' : 'text-white'
                        )}
                      >
                        {attendance.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {attendance.checkInTime} - {attendance.checkOutTime || 'In progress'}
                      </p>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No Record
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeamCalendarPage;
