import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  CalendarCheck,
  PlusCircle,
  Play,
  Square,
  Eye,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadSessions = async () => {
    try {
      const data = await attendanceService.getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
      showToast('Failed to load attendance sessions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      await attendanceService.changeSessionStatus(sessionId, newStatus);
      showToast(`Session is now ${newStatus.toLowerCase()}.`, 'success');
      loadSessions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update session status.', 'error');
    }
  };

  const handleDelete = async (session) => {
    if (!window.confirm(`Delete session for "${session.class_name}" on ${session.session_date}?\n\nThis will also remove all attendance records and seat reservations for this session.`)) return;
    try {
      await attendanceService.deleteSession(session.id);
      showToast('Session deleted successfully.', 'success');
      loadSessions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete session.', 'error');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      s.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.classroom_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.attendance_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="large" message="Loading attendance sessions..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            <span>Attendance Sessions</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create, start, monitor, and close physical classroom attendance sessions.
          </p>
        </div>

        <button
          onClick={() => navigate('/lecturer/create-session')}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class, room..."
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
            <option value="OPEN">Open (Active)</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Session Cards Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className={`p-6 rounded-3xl bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                s.status === 'OPEN'
                  ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-blue-500/10'
                  : 'border-blue-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {s.subject_code}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                      s.status === 'OPEN'
                        ? 'bg-green-50 text-green-700 border-green-200 animate-pulse'
                        : s.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 line-clamp-1">{s.class_name}</h3>
                <p className="text-xs text-gray-500">{s.subject_name}</p>

                <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Classroom:</span>
                    <span className="font-semibold text-gray-800">{s.classroom_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-800">{s.session_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="text-gray-800">
                      {s.start_time} - {s.end_time}
                    </span>
                  </div>
                  {s.attendance_code && (
                    <div className="flex justify-between items-center pt-1 border-t border-blue-100">
                      <span className="text-gray-500 flex items-center space-x-1.5">
                        <span>Code:</span>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Lecturer Only</span>
                      </span>
                      <span className="font-mono font-black text-blue-600 text-sm tracking-wider">
                        {s.attendance_code}
                      </span>
                    </div>
                  )}
                  {(s.start_student_id || s.end_student_id) && (
                    <div className="flex justify-between items-center pt-1 border-t border-blue-100">
                      <span className="text-gray-500">ID Range:</span>
                      <span className="font-mono font-semibold text-blue-700 text-xs">
                        {s.start_student_id || '—'} → {s.end_student_id || '—'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-1">
                  <span>Present: <b className="text-green-600">{s.present_count}</b></span>
                  <span>Reserved: <b className="text-blue-600">{s.total_reservations}</b></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate(`/lecturer/live-view/${s.id}`)}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Classroom View</span>
                </button>

                <div>
                  {s.status !== 'OPEN' ? (
                    <button
                      onClick={() => handleStatusChange(s.id, 'OPEN')}
                      className="w-full py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      <span>Open Session</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(s.id, 'CLOSED')}
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all"
                    >
                      <Square className="w-3 h-3" />
                      <span>Close Session</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(s)}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-blue-100 rounded-3xl shadow-sm">
          <p className="text-sm text-gray-500">No attendance sessions match the current filter.</p>
        </div>
      )}
    </div>
  );
}
