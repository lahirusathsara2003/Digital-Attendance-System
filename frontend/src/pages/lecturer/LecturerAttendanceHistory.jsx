import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import AttendanceTable from '../../components/AttendanceTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { History, Search, Filter } from 'lucide-react';

export default function LecturerAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const data = await attendanceService.getAllAttendance();
        setRecords(data || []);
      } catch (err) {
        console.error('Failed to load attendance records', err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.class_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="large" message="Loading attendance records..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
          <History className="w-7 h-7 text-blue-600" />
          <span>Attendance Records</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Historical attendance logs across your lecture sessions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, ID, subject, class..."
            className="w-full pl-9 pr-4 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      <AttendanceTable records={filtered} showStudent={true} />
    </div>
  );
}
