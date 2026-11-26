import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { adminService } from '../../services/adminService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import AttendanceTable from '../../components/AttendanceTable';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  CalendarCheck,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function AdminAttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit status modal
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('PRESENT');
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const loadAttendance = async () => {
    try {
      const data = await attendanceService.getAllAttendance();
      setRecords(data || []);
    } catch (err) {
      console.error('Failed to load attendance', err);
      showToast('Failed to load attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    setUpdating(true);
    try {
      await attendanceService.editAttendance?.(editingRecord.id, editStatus);
      // If endpoint in attendance service is manual or edit:
      const res = await fetch(`/api/attendance/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: editStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast('Attendance status updated successfully!', 'success');
      setEditingRecord(null);
      loadAttendance();
    } catch (err) {
      showToast('Failed to update attendance status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.classroom_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="large" message="Loading attendance database..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
          <CalendarCheck className="w-7 h-7 text-blue-600" />
          <span>Attendance Database Records</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Complete verified physical presence logs across all academic classes, subjects, and classrooms.
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
            placeholder="Search student, ID, subject, class, room..."
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

      <AttendanceTable
        records={filtered}
        showStudent={true}
        onEdit={(rec) => {
          setEditingRecord(rec);
          setEditStatus(rec.status);
        }}
      />

      {/* Edit Record Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title={`Edit Attendance - ${editingRecord?.student_name}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-gray-700 space-y-1">
            <div>Student ID: <b className="text-gray-900 font-mono">{editingRecord?.student_code}</b></div>
            <div>Class: <b className="text-gray-900">{editingRecord?.class_name}</b></div>
            <div>Seat: <b className="text-blue-700 font-bold">Seat #{editingRecord?.seat_number}</b></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['PRESENT', 'LATE', 'ABSENT'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEditStatus(st)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    editStatus === st
                      ? st === 'PRESENT'
                        ? 'bg-green-600 text-white border-green-500 shadow-md shadow-green-600/30'
                        : st === 'LATE'
                        ? 'bg-yellow-500 text-white border-yellow-400 shadow-md shadow-yellow-500/30'
                        : 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {updating ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
