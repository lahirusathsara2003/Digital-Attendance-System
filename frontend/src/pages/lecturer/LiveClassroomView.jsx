import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { lecturerService } from '../../services/lecturerService';
import { classroomService } from '../../services/classroomService';
import { useToast } from '../../context/ToastContext';
import SeatMap from '../../components/SeatMap';
import SeatLegend from '../../components/SeatLegend';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Play,
  Square,
  RefreshCw,
  ArrowLeft,
  Edit2,
} from 'lucide-react';

export default function LiveClassroomView() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [seatMapData, setSeatMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Session Details Modal
  const [editSessionModalOpen, setEditSessionModalOpen] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [savingSession, setSavingSession] = useState(false);
  const [editSessionForm, setEditSessionForm] = useState({
    session_date: '',
    start_time: '',
    end_time: '',
    attendance_code: '',
    start_student_id: '',
    end_student_id: '',
    classroom_id: '',
    status: '',
  });

  // Selected Student / Seat Modal
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState('PRESENT');
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [liveRes, seatRes] = await Promise.all([
        lecturerService.getSessionLiveView(sessionId),
        attendanceService.getSessionSeatMap(sessionId),
      ]);
      setSessionData(liveRes);
      setSeatMapData(seatRes);
    } catch (err) {
      console.error('Failed to load live view data', err);
      showToast('Failed to load live classroom data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Real-time live polling every 4 seconds
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleSeatClick = (seat) => {
    if (seat.session_status === 'RESERVED' && seat.reservation) {
      setSelectedSeat(seat);
      setEditingStatus(seat.reservation.attendance_status || 'PRESENT');
      setModalOpen(true);
    }
  };

  const handleUpdateStatus = async (attendanceId, newStatus) => {
    setUpdating(true);
    try {
      if (attendanceId) {
        await lecturerService.updateAttendance(attendanceId, newStatus);
      }
      showToast(`Status updated to ${newStatus}.`, 'success');
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleSessionStatus = async (newStatus) => {
    try {
      await attendanceService.changeSessionStatus(sessionId, newStatus);
      showToast(`Session is now ${newStatus.toLowerCase()}.`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to change session status.', 'error');
    }
  };

  const handleOpenEditSession = async () => {
    if (!session) return;
    setEditSessionForm({
      session_date: session.session_date || '',
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      attendance_code: session.attendance_code || '',
      start_student_id: session.start_student_id || '',
      end_student_id: session.end_student_id || '',
      classroom_id: session.classroom_id?.toString() || '',
      status: session.status || 'OPEN',
    });
    try {
      const crms = await classroomService.getClassrooms();
      setClassrooms(crms || []);
    } catch (e) {
      console.error(e);
    }
    setEditSessionModalOpen(true);
  };

  const handleRegenerateCodeInModal = () => {
    const prefix = session?.subject_code || 'ATT';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setEditSessionForm((prev) => ({ ...prev, attendance_code: `${prefix}-${randomDigits}` }));
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    setSavingSession(true);
    try {
      await attendanceService.updateSession(sessionId, {
        session_date: editSessionForm.session_date,
        start_time: editSessionForm.start_time,
        end_time: editSessionForm.end_time,
        attendance_code: editSessionForm.attendance_code.trim().toUpperCase(),
        start_student_id: editSessionForm.start_student_id.trim().toUpperCase() || null,
        end_student_id: editSessionForm.end_student_id.trim().toUpperCase() || null,
        classroom_id: editSessionForm.classroom_id ? parseInt(editSessionForm.classroom_id) : undefined,
        status: editSessionForm.status,
      });
      showToast('Session details updated successfully!', 'success');
      setEditSessionModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update session details', 'error');
    } finally {
      setSavingSession(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading live classroom..." />;
  }

  const session = sessionData?.session;
  const classroom = seatMapData?.classroom;
  const students = sessionData?.students || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/lecturer/sessions')}
          className="flex items-center space-x-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleOpenEditSession}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit Session Details</span>
          </button>

          {session?.status === 'OPEN' ? (
            <button
              onClick={() => handleToggleSessionStatus('CLOSED')}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Close Session</span>
            </button>
          ) : (
            <button
              onClick={() => handleToggleSessionStatus('OPEN')}
              className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Open Session</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-xl border border-blue-200 transition-all shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Session Title & Live Stats Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blue-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {session?.subject_code} - {session?.subject_name}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  session?.status === 'OPEN'
                    ? 'bg-green-50 text-green-700 border-green-200 animate-pulse'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {session?.status === 'OPEN' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                {session?.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{session?.class_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Classroom: <b className="text-gray-800">{session?.classroom_name}</b></span>
              {session?.attendance_code && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-medium text-gray-700">
                  <span>Session Code:</span>
                  <span className="font-mono font-black text-blue-600 text-sm tracking-wider">{session.attendance_code}</span>
                  <span className="text-[10px] text-amber-700 font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">Lecturer Only</span>
                </span>
              )}
            </div>
            {(session?.start_student_id || session?.end_student_id) && (
              <p className="text-xs text-blue-700 mt-1 font-mono">
                Allowed ID Range: <b>{session?.start_student_id || '—'}</b> → <b>{session?.end_student_id || '—'}</b>
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-green-50 border border-green-200 min-w-[70px]">
              <div className="text-[10px] text-green-700 uppercase font-semibold">Present</div>
              <div className="text-lg font-black text-green-700">{sessionData?.present_count || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 min-w-[70px]">
              <div className="text-[10px] text-red-700 uppercase font-semibold">Absent</div>
              <div className="text-lg font-black text-red-700">{sessionData?.absent_count || 0}</div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 min-w-[70px]">
              <div className="text-[10px] text-blue-700 uppercase font-semibold">Available</div>
              <div className="text-lg font-black text-blue-700">{seatMapData?.available_count || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Seating Map */}
      <div className="space-y-4">
        <SeatLegend showSelected={false} />

        <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col items-center">
          <SeatMap
            classroom={classroom}
            seats={seatMapData?.seats || []}
            isLecturerView={true}
            onLecturerSeatClick={handleSeatClick}
          />
        </div>
      </div>

      {/* Reserved Seat Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Seat #${selectedSeat?.seat_number} - Attendee Information`}
        maxWidth="max-w-md"
      >
        {selectedSeat && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-bold text-gray-900 text-sm">
                  {selectedSeat.reservation?.student_name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Student ID:</span>
                <span className="font-mono font-bold text-blue-600">
                  {selectedSeat.reservation?.student_code || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seat Location:</span>
                <span className="font-bold text-green-700">
                  Seat #{selectedSeat.seat_number} ({selectedSeat.block} Block - Row {selectedSeat.row_number})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reservation Time:</span>
                <span className="text-gray-800 font-semibold">
                  {selectedSeat.reservation?.reserved_at
                    ? new Date(selectedSeat.reservation.reserved_at).toLocaleTimeString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Attendance Time:</span>
                <span className="text-gray-800 font-semibold">
                  {selectedSeat.reservation?.attendance_time || 'Recorded'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                <span className="text-gray-500">Current Status:</span>
                <span className="font-black text-green-700 uppercase">
                  {selectedSeat.reservation?.attendance_status || 'PRESENT'}
                </span>
              </div>
            </div>

            {/* Quick Status Modify */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Modify Attendance Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['PRESENT', 'LATE', 'ABSENT'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditingStatus(st)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      editingStatus === st
                        ? st === 'PRESENT'
                          ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-500/20'
                          : st === 'LATE'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
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
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  const studentRec = students.find(
                    (s) => s.student_id === selectedSeat.reservation?.student_id
                  );
                  if (studentRec?.attendance_id) {
                    handleUpdateStatus(studentRec.attendance_id, editingStatus);
                  } else {
                    setModalOpen(false);
                  }
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Session Details Modal */}
      <Modal
        isOpen={editSessionModalOpen}
        onClose={() => setEditSessionModalOpen(false)}
        title="Edit Session Details"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Classroom
            </label>
            <select
              value={editSessionForm.classroom_id}
              onChange={(e) => setEditSessionForm({ ...editSessionForm, classroom_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {classrooms.length > 0 ? (
                classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.room_name} ({c.room_code}) - {c.rows} Rows, {c.total_seats_count} Seats
                  </option>
                ))
              ) : (
                <option value={session?.classroom_id}>{session?.classroom_name}</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Session Date
              </label>
              <input
                type="date"
                value={editSessionForm.session_date}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, session_date: e.target.value })}
                required
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={editSessionForm.start_time}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, start_time: e.target.value })}
                placeholder="e.g. 10:30 AM"
                required
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                value={editSessionForm.end_time}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, end_time: e.target.value })}
                placeholder="e.g. 12:30 PM"
                required
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Attendance Verification Code <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Lecturer Only</span>
              </label>
              <button
                type="button"
                onClick={handleRegenerateCodeInModal}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate Random</span>
              </button>
            </div>
            <input
              type="text"
              value={editSessionForm.attendance_code}
              onChange={(e) => setEditSessionForm({ ...editSessionForm, attendance_code: e.target.value.toUpperCase() })}
              placeholder="e.g. DS201-8392"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-600 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Start Student ID (Optional)
              </label>
              <input
                type="text"
                value={editSessionForm.start_student_id}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, start_student_id: e.target.value.toUpperCase() })}
                placeholder="e.g. DS001"
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs font-mono text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                End Student ID (Optional)
              </label>
              <input
                type="text"
                value={editSessionForm.end_student_id}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, end_student_id: e.target.value.toUpperCase() })}
                placeholder="e.g. DS050"
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs font-mono text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Session Status
            </label>
            <select
              value={editSessionForm.status}
              onChange={(e) => setEditSessionForm({ ...editSessionForm, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="OPEN">OPEN (Active Attendance)</option>
              <option value="NOT_STARTED">NOT_STARTED (Pending)</option>
              <option value="CLOSED">CLOSED (Ended)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditSessionModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSession}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
            >
              {savingSession ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Save Session Details</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
