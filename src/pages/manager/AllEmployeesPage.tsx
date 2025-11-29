import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Download, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers, mockAttendance } from '@/data/mockData';
import { AttendanceStatus } from '@/types';

const AllEmployeesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

  const employees = mockUsers.filter((u) => u.role === 'employee');

  const filteredAttendance = useMemo(() => {
    let filtered = mockAttendance.filter((a) => a.date === dateFilter);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchingUserIds = employees
        .filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.employeeId.toLowerCase().includes(query) ||
            u.department.toLowerCase().includes(query)
        )
        .map((u) => u.id);
      filtered = filtered.filter((a) => matchingUserIds.includes(a.userId));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      const userA = employees.find((u) => u.id === a.userId);
      const userB = employees.find((u) => u.id === b.userId);
      return (userA?.name || '').localeCompare(userB?.name || '');
    });
  }, [searchQuery, statusFilter, dateFilter, employees]);

  const exportToCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Status'];
    const rows = filteredAttendance.map((record) => {
      const user = employees.find((u) => u.id === record.userId);
      return [
        user?.employeeId || '-',
        user?.name || '-',
        user?.department || '-',
        record.date,
        record.checkInTime || '-',
        record.checkOutTime || '-',
        record.totalHours.toString(),
        record.status,
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-attendance-${dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Employees Attendance</h1>
            <p className="text-muted-foreground mt-1">
              View and filter attendance records for all team members
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="w-fit">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card variant="glass" className="animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as AttendanceStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{filteredAttendance.length}</strong> records found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <AttendanceTable
            attendance={filteredAttendance}
            users={employees}
            showUser
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllEmployeesPage;
