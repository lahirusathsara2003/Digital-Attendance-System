import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Building2,
  PlusCircle,
  Edit2,
  Trash2,
  Armchair,
  Settings,
  Grid,
} from 'lucide-react';

export default function ClassroomManagement() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [deletingClassroom, setDeletingClassroom] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    room_code: '',
    room_name: '',
    rows: 5,
    left_block_columns: 6,
    right_block_columns: 7,
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadClassrooms = async () => {
    try {
      const data = await classroomService.getClassrooms(true);
      setClassrooms(data || []);
    } catch (err) {
      console.error('Failed to load classrooms', err);
      showToast('Failed to load classrooms.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const handleSaveClassroom = async (e) => {
    e.preventDefault();
    try {
      if (editingClassroom) {
        await classroomService.updateClassroomLayout(editingClassroom.id, {
          room_name: formData.room_name,
          rows: parseInt(formData.rows),
          left_block_columns: parseInt(formData.left_block_columns),
          right_block_columns: parseInt(formData.right_block_columns),
        });
        showToast('Classroom layout updated and seats regenerated successfully!', 'success');
      } else {
        await classroomService.createClassroom({
          room_code: formData.room_code,
          room_name: formData.room_name,
          rows: parseInt(formData.rows),
          left_block_columns: parseInt(formData.left_block_columns),
          right_block_columns: parseInt(formData.right_block_columns),
        });
        showToast('Classroom created and seats generated successfully!', 'success');
      }
      setShowModal(false);
      setEditingClassroom(null);
      resetForm();
      loadClassrooms();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteClassroom = async () => {
    if (!deletingClassroom) return;
    try {
      await classroomService.deleteClassroom(deletingClassroom.id);
      showToast('Classroom deleted successfully.', 'success');
      setDeletingClassroom(null);
      loadClassrooms();
    } catch (err) {
      showToast('Failed to delete classroom.', 'error');
    }
  };

  const openEditModal = (crm) => {
    setEditingClassroom(crm);
    setFormData({
      room_code: crm.room_code,
      room_name: crm.room_name,
      rows: crm.rows,
      left_block_columns: crm.left_block_columns,
      right_block_columns: crm.right_block_columns,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      room_code: '',
      room_name: '',
      rows: 5,
      left_block_columns: 6,
      right_block_columns: 7,
    });
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading classrooms..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            <span>Classroom & Seating Layouts</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Configure lecture halls, seating blocks, rows, columns, and visual layout geometry.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClassroom(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Classroom</span>
        </button>
      </div>

      {/* Classroom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((crm) => (
          <div
            key={crm.id}
            className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-5 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {crm.room_code}
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  {crm.active_seats_count || crm.total_seats_count} Active Seats
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{crm.room_name}</h3>

              {/* Geometry Specs */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rows:</span>
                  <span className="font-bold text-gray-900">{crm.rows} Rows</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Left Block:</span>
                  <span className="font-bold text-blue-600">{crm.left_block_columns} Cols/Row</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Right Block:</span>
                  <span className="font-bold text-blue-600">{crm.right_block_columns} Cols/Row</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-100">
                  <span className="text-gray-500">Total Capacity:</span>
                  <span className="font-bold text-gray-900 font-mono">{crm.total_seats_count} Seats</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate(`/admin/classrooms/${crm.id}/seats`)}
                className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
              >
                <Grid className="w-4 h-4" />
                <span>Configure & Disable Seats</span>
              </button>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(crm)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Layout</span>
                </button>
                <button
                  onClick={() => setDeletingClassroom(crm)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Classroom Layout Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClassroom ? 'Configure Classroom Layout' : 'Create New Classroom'}
      >
        <form onSubmit={handleSaveClassroom} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Room Code
            </label>
            <input
              type="text"
              value={formData.room_code}
              onChange={(e) => setFormData({ ...formData, room_code: e.target.value.toUpperCase() })}
              placeholder="e.g. LH01"
              required
              disabled={!!editingClassroom}
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={formData.room_name}
              onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
              placeholder="e.g. Lecture Hall 01"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                required
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Left Block Cols
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={formData.left_block_columns}
                onChange={(e) => setFormData({ ...formData, left_block_columns: e.target.value })}
                required
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Right Block Cols
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={formData.right_block_columns}
                onChange={(e) => setFormData({ ...formData, right_block_columns: e.target.value })}
                required
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
            Calculated Seats:{' '}
            <b className="text-blue-950 font-mono">
              {parseInt(formData.rows || 0) * (parseInt(formData.left_block_columns || 0) + parseInt(formData.right_block_columns || 0))} Seats
            </b>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {editingClassroom ? 'Save & Regenerate Seats' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingClassroom}
        onClose={() => setDeletingClassroom(null)}
        onConfirm={handleDeleteClassroom}
        title="Delete Classroom"
        message={`Are you sure you want to delete '${deletingClassroom?.room_name}'?`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
