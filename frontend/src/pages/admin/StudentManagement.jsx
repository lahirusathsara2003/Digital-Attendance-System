import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  GraduationCap,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('password123');

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    status: 'ACTIVE',
  });

  const { showToast } = useToast();

  const loadStudents = async () => {
    try {
      const data = await adminService.getStudents(searchTerm);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students', err);
      showToast('Failed to load students list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [searchTerm]);

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await adminService.updateStudent(editingStudent.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        });
        showToast('Student updated successfully!', 'success');
      } else {
        await adminService.createStudent(formData);
        showToast('Student created successfully!', 'success');
      }
      setShowAddModal(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    try {
      await adminService.deleteStudent(deletingStudent.id);
      showToast('Student deleted successfully.', 'success');
      setDeletingStudent(null);
      loadStudents();
    } catch (err) {
      showToast('Failed to delete student.', 'error');
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

  const openEditModal = (st) => {
    setEditingStudent(st);
    setFormData({
      student_id: st.student_id,
      name: st.name,
      email: st.email,
      phone: st.phone || '',
      password: '',
      status: st.status || 'ACTIVE',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      name: '',
      email: '',
      phone: '',
      password: 'password123',
      status: 'ACTIVE',
    });
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading students..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <span>Student Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Register students, manage academic profile details, and control account access.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingStudent(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Student</span>
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
            placeholder="Search by student name, ID, email..."
            className="w-full pl-9 pr-4 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-gray-600 font-semibold">Total: {students.length} students</div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-white border border-blue-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-700">
            <thead className="bg-blue-50/60 text-blue-900 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Full Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-blue-600">{st.student_id}</td>
                  <td className="px-5 py-4 font-bold text-gray-900">{st.name}</td>
                  <td className="px-5 py-4 text-gray-600">{st.email}</td>
                  <td className="px-5 py-4 text-gray-500">{st.phone || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        st.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {st.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(st)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResettingUser(st)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingStudent(st)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Add New Student'}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value.toUpperCase() })}
              placeholder="e.g. DS001"
              required
              disabled={!!editingStudent}
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Nimal Perera"
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
              placeholder="e.g. nimal@student.edu"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 0771234567"
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {!editingStudent && (
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

          {editingStudent && (
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
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete ${deletingStudent?.name} (${deletingStudent?.student_id})? This will delete associated account and attendance records.`}
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
          <p className="text-xs text-gray-600">
            Enter a new password for student <b className="text-gray-900">{resettingUser?.name}</b>.
          </p>
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
