import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Attendance, AttendanceStatus, User } from '@/types';

interface AttendanceTableProps {
  attendance: Attendance[];
  users?: User[];
  showUser?: boolean;
}

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const AttendanceTable = ({ attendance, users, showUser = false }: AttendanceTableProps) => {
  const getUserName = (userId: string) => {
    return users?.find((u) => u.id === userId)?.name || 'Unknown';
  };

  const getUserEmployeeId = (userId: string) => {
    return users?.find((u) => u.id === userId)?.employeeId || '-';
  };

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {showUser && (
              <>
                <TableHead className="font-semibold">Employee ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
              </>
            )}
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Check In</TableHead>
            <TableHead className="font-semibold">Check Out</TableHead>
            <TableHead className="font-semibold">Total Hours</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showUser ? 7 : 5}
                className="h-32 text-center text-muted-foreground"
              >
                No attendance records found
              </TableCell>
            </TableRow>
          ) : (
            attendance.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/30">
                {showUser && (
                  <>
                    <TableCell className="font-mono text-sm">
                      {getUserEmployeeId(record.userId)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getUserName(record.userId)}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  {format(parseISO(record.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {record.checkInTime || '-'}
                </TableCell>
                <TableCell>
                  {record.checkOutTime || '-'}
                </TableCell>
                <TableCell>
                  {record.totalHours > 0 ? `${record.totalHours}h` : '-'}
                </TableCell>
                <TableCell>
                  <Badge className={cn('font-medium', statusConfig[record.status].className)}>
                    {statusConfig[record.status].label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
