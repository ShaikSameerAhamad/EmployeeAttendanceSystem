import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkIn, checkOut } from '@/store/slices/attendanceSlice';
import { toast } from '@/hooks/use-toast';
import { Attendance } from '@/types';

const CheckInOutCard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { todayAttendance } = useAppSelector((state) => state.attendance);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const isCheckedIn = !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  const hasCheckedOut = !!todayAttendance?.checkOutTime;

  const handleCheckIn = () => {
    const now = new Date();
    const hour = now.getHours();
    const isLate = hour >= 9;
    
    const attendance: Attendance = {
      id: `${user?.id}-${format(now, 'yyyy-MM-dd')}`,
      userId: user?.id || '',
      date: format(now, 'yyyy-MM-dd'),
      checkInTime: format(now, 'HH:mm'),
      checkOutTime: null,
      status: isLate ? 'late' : 'present',
      totalHours: 0,
      createdAt: now.toISOString(),
    };

    dispatch(checkIn(attendance));
    toast({
      title: "Checked In Successfully!",
      description: `You checked in at ${format(now, 'hh:mm a')}${isLate ? ' (Late)' : ''}`,
    });
  };

  const handleCheckOut = () => {
    if (!todayAttendance) return;

    const now = new Date();
    const checkInTime = todayAttendance.checkInTime?.split(':').map(Number);
    const checkInHour = checkInTime?.[0] || 9;
    const currentHour = now.getHours();
    const totalHours = Math.max(0, currentHour - checkInHour);
    const isHalfDay = totalHours < 5;

    const attendance: Attendance = {
      ...todayAttendance,
      checkOutTime: format(now, 'HH:mm'),
      status: isHalfDay ? 'half-day' : todayAttendance.status,
      totalHours,
    };

    dispatch(checkOut(attendance));
    toast({
      title: "Checked Out Successfully!",
      description: `You worked for ${totalHours} hours today.`,
    });
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="gradient-primary p-1">
        <CardHeader className="bg-card rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Quick Check In/Out
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* Current Time Display */}
          <div className="space-y-1">
            <p className="text-4xl font-bold tracking-tight">
              {format(currentTime, 'hh:mm:ss')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            {!todayAttendance && (
              <p className="text-muted-foreground">You haven't checked in today</p>
            )}
            {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
              <div className="space-y-1">
                <p className="text-success font-medium">You're checked in</p>
                <p className="text-sm text-muted-foreground">
                  Since {todayAttendance.checkInTime}
                </p>
              </div>
            )}
            {hasCheckedOut && (
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Day completed</p>
                <p className="text-sm text-muted-foreground">
                  {todayAttendance?.checkInTime} - {todayAttendance?.checkOutTime} ({todayAttendance?.totalHours}h)
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!hasCheckedOut && (
            <Button
              variant={isCheckedIn ? 'checkout' : 'checkin'}
              size="xl"
              className="w-full"
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            >
              {isCheckedIn ? (
                <>
                  <LogOut className="h-5 w-5" />
                  Check Out
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Check In
                </>
              )}
            </Button>
          )}

          {hasCheckedOut && (
            <div className="rounded-lg bg-success/10 p-4">
              <p className="text-success font-medium">
                Great job! See you tomorrow 👋
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckInOutCard;
