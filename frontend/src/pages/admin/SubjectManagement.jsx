import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BookOpen, PlusCircle, Search, Edit2, Trash2 } from 'lucide-react';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    description: '',
  });

  const { showToast } = useToast();

  const loadSubjects = async () => {
    try {
      const data = await adminService.getSubjects();
      setSubjects(data || []);
    } catch (err) {
      console.error('Failed to load subjects', err);
      showToast('Failed to load subjects list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await adminService.updateSubject(editingSubject.id, formData);
        showToast('Subject updated successfully!', 'success');
      } else {
        await adminService.createSubject(formData);
        showToast('Subject created successfully!', 'success');
      }
      setShowModal(false);
      setEditingSubject(null);
      setFormData({ subject_code: '', subject_name: '', description: '' });
      loadSubjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    try {
      await adminService.deleteSubject(deletingSubject.id);
      showToast('Subject deleted successfully.', 'success');
      setDeletingSubject(null);
      loadSubjects();
    } catch (err) {
      showToast('Failed to delete subject.', 'error');
    }
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setFormData({
      subject_code: sub.subject_code,
      subject_name: sub.subject_name,
      description: sub.description || '',
    });
    setShowModal(true);
  };

  const filtered = subjects.filter(
    (s) =>
      !searchTerm ||
      s.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="large" message="Loading academic subjects..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <span>Subject Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Maintain curriculum subjects, course codes, and catalog descriptions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSubject(null);
            setFormData({ subject_code: '', subject_name: '', description: '' });
            setShowModal(true);
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Subject</span>
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
            placeholder="Search by subject code or name..."
            className="w-full pl-9 pr-4 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-gray-600 font-semibold">Total: {subjects.length} subjects</div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sub) => (
          <div
            key={sub.id}
            className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {sub.subject_code}
                </span>
                <span className="text-xs text-gray-500 font-medium">{sub.classes_count} Classes</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{sub.subject_name}</h3>
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                {sub.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-blue-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => openEditModal(sub)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeletingSubject(sub)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Subject Code
            </label>
            <input
              type="text"
              value={formData.subject_code}
              onChange={(e) => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
              placeholder="e.g. DS201"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Subject Name
            </label>
            <input
              type="text"
              value={formData.subject_name}
              onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
              placeholder="e.g. Data Science Fundamentals"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a summary of the subject syllabus..."
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
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
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={`Are you sure you want to delete subject '${deletingSubject?.subject_code}'? All associated classes will also be affected.`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
