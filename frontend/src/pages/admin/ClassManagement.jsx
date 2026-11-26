import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  School,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Users,
  BookOpen,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);

  // Enrollment Modal
  const [enrollingClass, setEnrollingClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Class Form State
  const [formData, setFormData] = useState({
    subject_id: '',
    lecturer_id: '',
    class_name: '',
    semester: 'Semester 2',
    academic_year: '2026',
  });

  const { showToast } = useToast();

  const loadAll = async () => {
    try {
      const [clsData, subData, lecData, stuData] = await Promise.all([
        classService.getClasses(),
        adminService.getSubjects(),
        adminService.getLecturers(),
        adminService.getStudents(),
      ]);
      setClasses(clsData || []);
      setSubjects(subData || []);
      setLecturers(lecData || []);
      setAllStudents(stuData || []);
    } catch (err) {
      console.error('Failed to load classes data', err);
      showToast('Failed to load class configuration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, formData);
        showToast('Class updated successfully!', 'success');
      } else {
        await classService.createClass(formData);
        showToast('Class created successfully!', 'success');
      }
      setShowClassModal(false);
      setEditingClass(null);
      setFormData({ subject_id: '', lecturer_id: '', class_name: '', semester: 'Semester 2', academic_year: '2026' });
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    try {
      await classService.deleteClass(deletingClass.id);
      showToast('Class deleted successfully.', 'success');
      setDeletingClass(null);
      loadAll();
    } catch (err) {
      showToast('Failed to delete class.', 'error');
    }
  };

  const openEnrollModal = async (cls) => {
    setEnrollingClass(cls);
    setEnrollLoading(true);
    try {
      const students = await classService.getClassStudents(cls.id);
      setClassStudents(students || []);
    } catch (err) {
      showToast('Failed to load enrolled students.', 'error');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentToEnroll || !enrollingClass) return;
    try {
      await classService.enrollStudent(enrollingClass.id, parseInt(selectedStudentToEnroll));
      showToast('Student enrolled successfully!', 'success');
      setSelectedStudentToEnroll('');
      const updated = await classService.getClassStudents(enrollingClass.id);
      setClassStudents(updated);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Enrollment failed.', 'error');
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!enrollingClass) return;
    try {
      await classService.unenrollStudent(enrollingClass.id, studentId);
      showToast('Student removed from class.', 'success');
      const updated = await classService.getClassStudents(enrollingClass.id);
      setClassStudents(updated);
      loadAll();
    } catch (err) {
      showToast('Failed to unenroll student.', 'error');
    }
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      subject_id: cls.subject_id,
      lecturer_id: cls.lecturer_id || '',
      class_name: cls.class_name,
      semester: cls.semester,
      academic_year: cls.academic_year,
    });
    setShowClassModal(true);
  };

  const filtered = classes.filter(
    (c) =>
      !searchTerm ||
      c.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="large" message="Loading classes..." />;
  }

  // Find students not yet enrolled in the selected class
  const enrolledStudentIds = new Set(classStudents.map((s) => s.id));
  const availableToEnroll = allStudents.filter((s) => !enrolledStudentIds.has(s.id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <School className="w-7 h-7 text-blue-600" />
            <span>Class & Enrollment Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Assign lecturers, schedule courses, and enroll students into respective classes.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClass(null);
            setFormData({
              subject_id: subjects[0]?.id || '',
              lecturer_id: lecturers[0]?.id || '',
              class_name: '',
              semester: 'Semester 2',
              academic_year: '2026',
            });
            setShowClassModal(true);
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Class</span>
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
            placeholder="Search class, subject, lecturer..."
            className="w-full pl-9 pr-4 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-gray-600 font-semibold">Total: {classes.length} classes</div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cls) => (
          <div
            key={cls.id}
            className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {cls.subject_code}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {cls.semester} ({cls.academic_year})
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.class_name}</h3>
              <p className="text-xs text-gray-600 mb-3">{cls.subject_name}</p>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Lecturer:</span>
                  <span className="font-bold text-gray-800">{cls.lecturer_name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrolled Students:</span>
                  <span className="font-bold text-blue-600">{cls.enrolled_students_count} students</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => openEnrollModal(cls)}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Enrollments ({cls.enrolled_students_count})</span>
              </button>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(cls)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingClass(cls)}
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

      {/* Create / Edit Class Modal */}
      <Modal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        title={editingClass ? 'Edit Class Details' : 'Create New Class'}
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Class Name
            </label>
            <input
              type="text"
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              placeholder="e.g. DS201 - Data Science Batch 2026"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Select Subject
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Assign Lecturer
            </label>
            <select
              value={formData.lecturer_id}
              onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">Unassigned</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lecturer_id} - {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder="e.g. Semester 2"
                required
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                placeholder="e.g. 2026"
                required
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowClassModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {editingClass ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enrollment Management Modal */}
      <Modal
        isOpen={!!enrollingClass}
        onClose={() => setEnrollingClass(null)}
        title={`Enroll Students - ${enrollingClass?.class_name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Enroll New Student Form */}
          <form onSubmit={handleEnrollStudent} className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Add Student to this Class
            </label>
            <div className="flex gap-3">
              <select
                value={selectedStudentToEnroll}
                onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select student to enroll...</option>
                {availableToEnroll.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.student_id} - {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedStudentToEnroll}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll</span>
              </button>
            </div>
          </form>

          {/* Enrolled Students Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Enrolled Students ({classStudents.length})
            </h4>

            {enrollLoading ? (
              <LoadingSpinner size="small" message="Loading roster..." />
            ) : classStudents.length > 0 ? (
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-blue-100 bg-white shadow-xs">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-blue-50/70 text-blue-900 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">ID</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {classStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-bold text-blue-600">{st.student_id}</td>
                        <td className="px-4 py-2.5 font-bold text-gray-900">{st.name}</td>
                        <td className="px-4 py-2.5 text-gray-600">{st.email}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => handleUnenrollStudent(st.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No students currently enrolled in this class.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        onConfirm={handleDeleteClass}
        title="Delete Class"
        message={`Are you sure you want to delete '${deletingClass?.class_name}'?`}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
