import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services/attendanceService';
import SeatMap from '../../components/SeatMap';
import SeatLegend from '../../components/SeatLegend';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Armchair,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function SeatReservationPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirmation form state
  const studentProfile = user?.profile;
  const [confirmStudentId, setConfirmStudentId] = useState(studentProfile?.student_id || '');
  const [confirmName, setConfirmName] = useState(studentProfile?.name || '');

  const studentReservation =
    seatData?.current_student_reservation ||
    seatData?.seats?.find((s) => s.reserved_by_current_student || s.is_my_seat);
  const hasExistingReservation = Boolean(seatData?.current_student_has_reserved || studentReservation);

  const loadSeatMap = async () => {
    if (!sessionId) {
      showToast('No attendance session selected.', 'error');
      navigate('/student/select-class');
      return;
    }

    try {
      const res = await attendanceService.getSessionSeatMap(sessionId);
      setSeatData(res);
    } catch (err) {
      console.error('Failed to load seat layout', err);
      showToast(err.response?.data?.message || 'Failed to load classroom seating layout.', 'error');
      navigate('/student/select-class');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatMap();
    // Poll seat map every 5 seconds for live availability updates
    const interval = setInterval(loadSeatMap, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleSeatClick = (seat) => {
    if (hasExistingReservation) {
      showToast('You have already marked attendance for this class. You cannot mark more than one seat.', 'warning');
      return;
    }
    if (seat.session_status === 'AVAILABLE') {
      setSelectedSeat(seat);
    }
  };

  const handleOpenConfirmation = () => {
    if (hasExistingReservation) {
      showToast('You have already marked attendance for this class. You cannot mark more than one seat.', 'error');
      return;
    }
    if (!selectedSeat) {
      showToast('Please select an available seat first.', 'error');
      return;
    }
    setConfirmStudentId(studentProfile?.student_id || '');
    setConfirmName(studentProfile?.name || '');
    setShowConfirmModal(true);
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!selectedSeat) return;

    if (!confirmStudentId.trim() || !confirmName.trim()) {
      showToast('Please confirm your Student ID and Name.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await attendanceService.reserveSeat(
        sessionId,
        selectedSeat.id,
        confirmStudentId.trim(),
        confirmName.trim()
      );

      showToast('Seat reserved and attendance marked successfully!', 'success');
      setShowConfirmModal(false);
      
      // Navigate to Attendance Confirmation receipt
      navigate(`/student/confirmation?session_id=${sessionId}`, {
        state: { confirmationData: response.attendance },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reserve seat.';
      showToast(msg, 'error');
      // Refresh seat map in case seat was taken by someone else
      loadSeatMap();
      setSelectedSeat(null);
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading classroom seating layout..." />;
  }

  const session = seatData?.session;
  const classroom = seatData?.classroom;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Session Details Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blue-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP 2: SELECT CLASSROOM SEAT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Classroom Seats</h1>
            <p className="text-xs text-gray-600 mt-1">
              Select your physical seat location. This action will automatically record your attendance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>SESSION OPEN</span>
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <div className="text-gray-600 flex items-center space-x-1 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Subject & Class</span>
            </div>
            <div className="font-bold text-gray-900 text-sm truncate">{session?.subject_name}</div>
            <div className="text-[11px] text-blue-600 font-medium">{session?.class_name}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <div className="text-gray-600 flex items-center space-x-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-green-600" />
              <span>Room Location</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{classroom?.room_name}</div>
            <div className="text-[11px] text-green-600 font-mono font-medium">{classroom?.room_code}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <div className="text-gray-600 flex items-center space-x-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Date</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{session?.session_date}</div>
            <div className="text-[11px] text-gray-600 font-medium">Today's Class</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <div className="text-gray-600 flex items-center space-x-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>Session Time</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">
              {session?.start_time} - {session?.end_time}
            </div>
            <div className="text-[11px] text-red-600 font-medium">Active Attendance</div>
          </div>
        </div>
      </div>

      {/* Banner if student already reserved a seat in this class */}
      {hasExistingReservation && (
        <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Attendance Already Marked For This Class</h4>
              <p className="text-xs text-gray-700 mt-0.5">
                You have reserved <span className="font-bold text-gray-900">Seat #{studentReservation?.seat_number || studentReservation?.seat?.seat_number || 'Reserved'}</span>. Each student can only reserve 1 seat per class.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/student/confirmation?session_id=${sessionId}`)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>View Receipt</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Legend */}
      <SeatLegend showSelected={!hasExistingReservation} showMySeat={hasExistingReservation} />

      {/* Seating Layout Grid */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col items-center">
        <SeatMap
          classroom={classroom}
          seats={seatData?.seats || []}
          selectedSeat={selectedSeat}
          onSelectSeat={handleSeatClick}
          disabled={hasExistingReservation}
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-2xl bg-white border border-blue-100 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600">
              {hasExistingReservation ? 'Your Confirmed Seat:' : 'Selected Seat:'}
            </div>
            <div className="text-lg font-black text-gray-900">
              {hasExistingReservation ? (
                <span className="text-blue-600 font-mono">
                  Seat #{studentReservation?.seat_number || studentReservation?.seat?.seat_number || 'Reserved'}{' '}
                  <span className="text-xs text-green-600 font-sans font-bold">(Marked Present)</span>
                </span>
              ) : selectedSeat ? (
                <span className="text-green-600">
                  Seat #{selectedSeat.seat_number} ({selectedSeat.block} Block - Row {selectedSeat.row_number})
                </span>
              ) : (
                <span className="text-gray-500 font-medium text-sm">None selected (Click any white seat)</span>
              )}
            </div>
          </div>
        </div>

        {hasExistingReservation ? (
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              disabled
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-50 border border-blue-100 text-gray-600 font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Seat Already Marked (1 Seat Allowed)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/student/confirmation?session_id=${sessionId}`)}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>View Receipt</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenConfirmation}
            disabled={!selectedSeat}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Reserve Seat & Confirm Attendance</span>
          </button>
        )}
      </div>

      {/* Student Identity Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Student Identity & Seat"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReservation} className="space-y-4">
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 text-xs space-y-1">
            <p className="font-bold text-green-800">You are reserving:</p>
            <p>
              Seat <span className="font-bold font-mono text-gray-900 text-sm">#{selectedSeat?.seat_number}</span> in{' '}
              <span className="font-bold text-gray-900">{classroom?.room_name}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Confirm Student ID
            </label>
            <input
              type="text"
              value={confirmStudentId}
              onChange={(e) => setConfirmStudentId(e.target.value)}
              placeholder="e.g. DS001"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Confirm Full Name
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="e.g. Nimal Perera"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Mark Attendance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
