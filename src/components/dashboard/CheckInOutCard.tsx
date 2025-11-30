import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkIn, checkOut } from '@/store/slices/attendanceSlice';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CheckInOutCardProps {
  className?: string;
}

const CheckInOutCard = ({ className }: CheckInOutCardProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { todayAttendance } = useAppSelector((state) => state.attendance);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isCheckedIn = !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  const hasCheckedOut = !!todayAttendance?.checkOutTime;

  const handleCheckIn = async () => {
    const now = new Date();
    const hour = now.getHours();
    const isLate = hour >= 9;
    try {
      await dispatch(checkIn()).unwrap();
      toast({
        title: 'Checked In Successfully!',
        description: `You checked in at ${format(now, 'hh:mm a')}${isLate ? ' (Late)' : ''}`,
      });
    } catch (error: any) {
      toast({
        title: 'Unable to check in',
        description: error?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    const now = new Date();
    const checkInTime = todayAttendance.checkInTime?.split(':').map(Number);
    const checkInHour = checkInTime?.[0] || 9;
    const currentHour = now.getHours();
    const totalHours = Math.max(0, currentHour - checkInHour);
    const isHalfDay = totalHours < 5;

    try {
      await dispatch(checkOut()).unwrap();
      toast({
        title: 'Checked Out Successfully!',
        description: `You worked for ${totalHours} hour${totalHours === 1 ? '' : 's'} today${
          isHalfDay ? ' (Half Day)' : ''
        }.`,
      });
    } catch (error: any) {
      toast({
        title: 'Unable to check out',
        description: error?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card
      variant="elevated"
      className={cn('overflow-hidden glass-effect flex h-full flex-col', className)}
    >
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary-purple purple-glow">
            <Clock className="h-5 w-5 text-white" />
          </div>
          Quick Check In/Out
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-6">
        <div className="flex h-full flex-col gap-6 text-center">
          {/* Current Time Display */}
          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tight text-white">
              {format(currentTime, 'hh:mm:ss')}
            </p>
            <p className="text-sm text-white/70">
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
          <div className="mt-auto space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckInOutCard;
