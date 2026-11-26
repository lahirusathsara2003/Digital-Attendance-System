import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { useToast } from '../../context/ToastContext';
import SeatMap from '../../components/SeatMap';
import SeatLegend from '../../components/SeatLegend';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Grid,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit2,
  Lock,
  Unlock,
  Building2,
} from 'lucide-react';

export default function ClassroomSeatsConfig() {
  const { classroomId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected seat for editing
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [seatNumberInput, setSeatNumberInput] = useState('');
  const [seatStatusInput, setSeatStatusInput] = useState('AVAILABLE');
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadClassroomSeats = async () => {
    try {
      const data = await classroomService.getClassroom(classroomId, true);
      setClassroom(data);
    } catch (err) {
      console.error('Failed to load classroom seats', err);
      showToast('Failed to load classroom seats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassroomSeats();
  }, [classroomId]);

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setSeatNumberInput(seat.seat_number);
    setSeatStatusInput(seat.status);
    setSeatModalOpen(true);
  };

  const handleSaveSeat = async (e) => {
    e.preventDefault();
    if (!selectedSeat) return;

    setSaving(true);
    try {
      await classroomService.updateSeatStatus(
        selectedSeat.id,
        seatStatusInput,
        seatNumberInput.trim()
      );
      showToast(`Seat ${seatNumberInput} updated!`, 'success');
      setSeatModalOpen(false);
      loadClassroomSeats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update seat.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBatchToggle = async (status) => {
    if (!classroom?.seats) return;
    const allSeatIds = classroom.seats.map((s) => s.id);
    try {
      await classroomService.batchUpdateSeats(allSeatIds, status);
      showToast(`All seats set to ${status}.`, 'success');
      loadClassroomSeats();
    } catch (err) {
      showToast('Failed to update all seats.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading classroom seat editor..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/classrooms')}
          className="flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classrooms</span>
        </button>

        {/* Batch Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleBatchToggle('AVAILABLE')}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Enable All Seats</span>
          </button>
          <button
            onClick={() => handleBatchToggle('UNAVAILABLE')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Disable All Seats</span>
          </button>
        </div>
      </div>

      {/* Classroom Banner */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {classroom?.room_code}
            </span>
            <span className="text-xs text-gray-500">Classroom Seat Configurator</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{classroom?.room_name}</h1>
          <p className="text-xs text-gray-600 mt-1">
            Click any seat to edit its number or disable it (e.g. broken desk or reserved position).
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
            <span className="text-gray-500 block text-[10px] uppercase">Active</span>
            <span className="text-base font-bold text-blue-600 font-mono">
              {classroom?.seats?.filter((s) => s.status !== 'UNAVAILABLE').length || 0}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-gray-500 block text-[10px] uppercase">Disabled</span>
            <span className="text-base font-bold text-gray-600 font-mono">
              {classroom?.seats?.filter((s) => s.status === 'UNAVAILABLE').length || 0}
            </span>
          </div>
        </div>
      </div>

      <SeatLegend showSelected={false} />

      {/* Visual Seat Map */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col items-center">
        <SeatMap
          classroom={classroom}
          seats={classroom?.seats || []}
          onSelectSeat={handleSeatClick}
        />
      </div>

      {/* Seat Config Modal */}
      <Modal
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        title={`Configure Seat #${selectedSeat?.seat_number}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveSeat} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Seat Number / Code
            </label>
            <input
              type="text"
              value={seatNumberInput}
              onChange={(e) => setSeatNumberInput(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Seat Status
            </label>
            <select
              value={seatStatusInput}
              onChange={(e) => setSeatStatusInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="AVAILABLE">AVAILABLE (Enabled & Bookable)</option>
              <option value="UNAVAILABLE">UNAVAILABLE (Disabled / Blocked)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-gray-700 space-y-1">
            <div>Block: <b className="text-gray-900">{selectedSeat?.block} Block</b></div>
            <div>Row: <b className="text-gray-900">Row {selectedSeat?.row_number}</b></div>
            <div>Column: <b className="text-gray-900">Col {selectedSeat?.column_number}</b></div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setSeatModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Seat'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
