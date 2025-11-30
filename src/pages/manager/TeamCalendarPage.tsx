import { useEffect, useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isWeekend,
  isAfter,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { managerAttendanceAPI } from '@/services/api';
import { Attendance, AttendanceStatus, User } from '@/types';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-success',
  absent: 'bg-destructive',
  late: 'bg-late',
  'half-day': 'bg-halfday',
};

const TeamCalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const departments = useMemo(() => {
    const set = new Set(employees.map((emp) => emp.department));
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === 'all') return employees;
    return employees.filter((emp) => emp.department === selectedDepartment);
  }, [selectedDepartment, employees]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);
  const startDate = format(monthStart, 'yyyy-MM-dd');
  const endDate = format(monthEnd, 'yyyy-MM-dd');

  const attendanceByDate = useMemo(() => {
    const map = new Map<string, Attendance[]>();
    attendanceRecords.forEach((record) => {
      const normalizedDate = format(new Date(record.date), 'yyyy-MM-dd');
      const list = map.get(normalizedDate) || [];
      list.push(record);
      map.set(normalizedDate, list);
    });
    return map;
  }, [attendanceRecords]);

  const mergeEmployees = (records: Attendance[]) => {
    setEmployees((prev) => {
      const map = new Map(prev.map((emp) => [emp.id, emp]));
      records.forEach((record) => {
        if (typeof record.userId === 'object' && record.userId) {
          const populated: any = record.userId;
          const id = populated.id || populated._id;
          if (!id || map.has(id)) return;
          map.set(id, {
            id,
            name: populated.name || 'Unknown',
            email: populated.email || 'not-provided@example.com',
            role: 'employee',
            employeeId: populated.employeeId || 'N/A',
            department: populated.department || 'General',
            createdAt: populated.createdAt || new Date().toISOString(),
          });
        }
      });
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await managerAttendanceAPI.getTodayStatus();
        if (data.success) {
          const combined = [
            ...data.data.presentEmployees,
            ...data.data.absentEmployees,
          ] as User[];
          const normalized = combined.map((emp) => ({
            ...emp,
            id: emp.id || (emp as any)._id || emp.employeeId || emp.email,
          }));
          const unique = Array.from(new Map(normalized.map((emp) => [emp.id, emp])).values());
          setEmployees(unique);
        }
      } catch (error) {
        toast({
          title: 'Unable to load team members',
          description: 'Please refresh or try again later.',
          variant: 'destructive',
        });
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const data = await managerAttendanceAPI.getAll({ startDate, endDate });
        if (data.success) {
          setAttendanceRecords(data.data);
          mergeEmployees(data.data);
        }
      } catch (error) {
        toast({
          title: 'Unable to load attendance',
          description: 'Please try again in a few moments.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [startDate, endDate]);

  const getRecordKey = (record: Attendance) => {
    if (typeof record.userId === 'string') return record.userId;
    const populated: any = record.userId;
    return populated.id || populated._id || populated.employeeId;
  };

  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
    };

    const dayRecords = attendanceByDate.get(dateStr) || [];
    const recordMap = new Map(dayRecords.map((record) => [getRecordKey(record), record]));

    filteredEmployees.forEach((employee) => {
      const record = recordMap.get(employee.id);
      if (!record) {
        stats.absent += 1;
        return;
      }
      if (record.status === 'present') stats.present += 1;
      else if (record.status === 'late') stats.late += 1;
      else if (record.status === 'half-day') stats.halfDay += 1;
      else stats.absent += 1;
    });

    return stats;
  };

  const selectedDateData = useMemo(() => {
    if (!selectedDate) return [];
    const dayRecords = attendanceByDate.get(selectedDate) || [];
    const recordMap = new Map(dayRecords.map((record) => [getRecordKey(record), record]));

    return filteredEmployees.map((employee) => ({
      employee,
      attendance: recordMap.get(employee.id),
    }));
  }, [selectedDate, attendanceByDate, filteredEmployees]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground">Loading attendance...</p>
                </div>
              )}
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
                  const isFuture = isAfter(day, new Date());
                  const stats = getDayStats(day);
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const hasData =
                    stats.present + stats.late + stats.halfDay + stats.absent > 0 &&
                    filteredEmployees.length > 0;

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isFuture && setSelectedDate(dateStr)}
                      disabled={isFuture || filteredEmployees.length === 0}
                      className={cn(
                        'aspect-square rounded-lg p-2 text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1',
                        'hover:scale-105 hover:shadow-md',
                        'focus:outline-none focus:ring-2 focus:ring-[#AE63F0] focus:ring-offset-2 focus:ring-offset-background',
                        isWeekendDay && 'bg-muted/50',
                        isFuture && 'opacity-50 cursor-not-allowed',
                        !isFuture && 'bg-card border hover:border-[#AE63F0]'
                      )}
                    >
                      <span className="font-semibold">{format(day, 'd')}</span>
                      {!isFuture && hasData && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold">
                          {stats.present > 0 && <span className="text-success">P{stats.present}</span>}
                          {stats.late > 0 && <span className="text-late">L{stats.late}</span>}
                          {stats.halfDay > 0 && <span className="text-halfday">H{stats.halfDay}</span>}
                          {stats.absent > 0 && <span className="text-destructive">A{stats.absent}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Detail Dialog */}
  <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Attendance for {selectedDate && format(new Date(selectedDate), 'MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {selectedDateData && selectedDateData.length > 0 ? (
                selectedDateData.map(({ employee, attendance }) => (
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
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">No employees match the selected filters.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeamCalendarPage;
