import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, PlusCircle, Search, Edit2, Trash2, KeyRound } from 'lucide-react';

export default function LecturerManagement() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [deletingLecturer, setDeletingLecturer] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('password123');

  const [formData, setFormData] = useState({
    lecturer_id: '',
    name: '',
    email: '',
    password: 'password123',
    status: 'ACTIVE',
  });

  const { showToast } = useToast();

  const loadLecturers = async () => {
    try {
      const data = await adminService.getLecturers(searchTerm);
      setLecturers(data || []);
    } catch (err) {
      console.error('Failed to load lecturers', err);
      showToast('Failed to load lecturers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLecturers();
  }, [searchTerm]);

  const handleSaveLecturer = async (e) => {
    e.preventDefault();
    try {
      if (editingLecturer) {
        await adminService.updateLecturer(editingLecturer.id, {
          name: formData.name,
          email: formData.email,
          status: formData.status,
        });
        showToast('Lecturer updated successfully!', 'success');
      } else {
        await adminService.createLecturer(formData);
        showToast('Lecturer created successfully!', 'success');
      }
      setShowAddModal(false);
      setEditingLecturer(null);
      resetForm();
      loadLecturers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteLecturer = async () => {
    if (!deletingLecturer) return;
    try {
      await adminService.deleteLecturer(deletingLecturer.id);
      showToast('Lecturer deleted successfully.', 'success');
      setDeletingLecturer(null);
      loadLecturers();
    } catch (err) {
      showToast('Failed to delete lecturer.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resettingUser) return;
    try {
      await adminService.resetUserPassword(resettingUser.user_id, newPassword);
      showToast('Password has been reset successfully.', 'success');
      setResettingUser(null);
      setNewPassword('password123');
    } catch (err) {
      showToast('Failed to reset password.', 'error');
    }
  };

  const openEditModal = (lec) => {
    setEditingLecturer(lec);
    setFormData({
      lecturer_id: lec.lecturer_id,
      name: lec.name,
      email: lec.email,
      password: '',
      status: lec.status || 'ACTIVE',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      lecturer_id: '',
      name: '',
      email: '',
      password: 'password123',
      status: 'ACTIVE',
    });
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading lecturers..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Lecturer Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage academic faculty, assign classes, and maintain lecturer profiles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingLecturer(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Lecturer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by lecturer name, ID, email..."
            className="w-full pl-9 pr-4 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-gray-600 font-semibold">Total: {lecturers.length} lecturers</div>
      </div>

      {/* Lecturers Table */}
      <div className="rounded-3xl bg-white border border-blue-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-700">
            <thead className="bg-blue-50/60 text-blue-900 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Lecturer ID</th>
                <th className="px-5 py-4">Full Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4 text-center">Assigned Classes</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {lecturers.map((lec) => (
                <tr key={lec.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-blue-600">{lec.lecturer_id}</td>
                  <td className="px-5 py-4 font-bold text-gray-900">{lec.name}</td>
                  <td className="px-5 py-4 text-gray-600">{lec.email}</td>
                  <td className="px-5 py-4 text-center font-semibold text-gray-900">{lec.assigned_classes_count}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        lec.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {lec.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(lec)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Lecturer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResettingUser(lec)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingLecturer(lec)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Lecturer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Lecturer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingLecturer ? 'Edit Lecturer Profile' : 'Add New Lecturer'}
      >
        <form onSubmit={handleSaveLecturer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Lecturer ID
            </label>
            <input
              type="text"
              value={formData.lecturer_id}
              onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value.toUpperCase() })}
              placeholder="e.g. L001"
              required
              disabled={!!editingLecturer}
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name (with Title)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Perera"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. dr.perera@attendance.edu"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {!editingLecturer && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Initial Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Default: password123"
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          )}

          {editingLecturer && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {editingLecturer ? 'Save Changes' : 'Create Lecturer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingLecturer}
        onClose={() => setDeletingLecturer(null)}
        onConfirm={handleDeleteLecturer}
        title="Delete Lecturer"
        message={`Are you sure you want to delete ${deletingLecturer?.name} (${deletingLecturer?.lecturer_id})?`}
        confirmText="Delete"
        isDanger={true}
      />

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resettingUser}
        onClose={() => setResettingUser(null)}
        title={`Reset Password: ${resettingUser?.name}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setResettingUser(null)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Set New Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
