import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Attendance, AttendanceStatus, User } from '@/types';

interface AttendanceTableProps {
  attendance: Attendance[];
  users?: User[];
  showUser?: boolean;
  pageSize?: number;
}

const statusConfig: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-success text-success-foreground' },
  absent: { label: 'Absent', className: 'bg-destructive text-destructive-foreground' },
  late: { label: 'Late', className: 'bg-late text-late-foreground' },
  'half-day': { label: 'Half Day', className: 'bg-halfday text-halfday-foreground' },
};

const AttendanceTable = ({ attendance, users, showUser = false, pageSize = 5 }: AttendanceTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(attendance.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRecords = attendance.slice(startIndex, endIndex);

  const getUserName = (userId: string) => {
    return users?.find((u) => u.id === userId)?.name || 'Unknown';
  };

  const getUserEmployeeId = (userId: string) => {
    return users?.find((u) => u.id === userId)?.employeeId || '-';
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  return (
    <div className="space-y-4">
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
            currentRecords.map((record) => (
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

      {/* Pagination Controls */}
      {attendance.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(endIndex, attendance.length)}</span> of{' '}
            <span className="font-medium text-foreground">{attendance.length}</span> records
          </p>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
