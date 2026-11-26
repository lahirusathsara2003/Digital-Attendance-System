import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lecturerService } from '../../services/lecturerService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Users,
  CheckCircle,
  XCircle,
  Armchair,
  PlusCircle,
  CalendarCheck,
  ArrowRight,
  Eye,
  Radio,
  Edit2,
} from 'lucide-react';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingClass, setUpdatingClass] = useState(false);
  const [editFormData, setEditFormData] = useState({
    class_name: '',
    semester: '',
    academic_year: '',
  });
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await lecturerService.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load lecturer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenEditClass = (cls) => {
    setEditingClass(cls);
    setEditFormData({
      class_name: cls.class_name,
      semester: cls.semester,
      academic_year: cls.academic_year,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    setUpdatingClass(true);
    try {
      await classService.updateClass(editingClass.id, editFormData);
      showToast('Class updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditingClass(null);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update class', 'error');
    } finally {
      setUpdatingClass(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading lecturer dashboard..." />;
  }

  const lecturer = data?.lecturer || user?.profile;
  const activeStats = data?.active_sessions_stats || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
            <span>LECTURER CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {lecturer?.name || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
            Lecturer ID: <span className="font-mono text-white font-bold">{lecturer?.lecturer_id}</span> • {lecturer?.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/lecturer/create-session')}
            className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Start Attendance Session</span>
          </button>
        </div>
      </div>

      {/* Active Attendance Sessions Real-Time Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
          <span>Active Live Attendance Sessions</span>
        </h3>

        {activeStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeStats.map((item) => {
              const s = item.session;
              return (
                <div
                  key={s.id}
                  className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {s.subject_code} - {s.subject_name}
                      </span>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> OPEN
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mt-1">{s.class_name}</h4>
                    <p className="text-xs text-gray-600">Classroom: {s.classroom_name} ({s.classroom_code})</p>

                    <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                      {s.attendance_code ? (
                        <div>
                          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                            <span>Attendance Code</span>
                            <span className="text-[9px] text-blue-700 bg-blue-100/60 border border-blue-200 px-1.5 py-0.5 rounded font-bold">Lecturer Only</span>
                          </div>
                          <div className="text-xl font-mono font-black text-blue-600 tracking-wider mt-0.5">
                            {s.attendance_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600 font-medium">Session Time:</span>
                      )}
                      <div className="text-right text-[11px] text-gray-600 font-semibold">
                        {s.start_time} - {s.end_time}
                      </div>
                    </div>

                    {/* Live Stats Breakdown */}
                    <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                      <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                        <div className="text-[10px] text-gray-600 font-semibold uppercase">Total</div>
                        <div className="text-base font-black text-gray-900">{item.total_students}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                        <div className="text-[10px] text-green-700 font-semibold uppercase">Present</div>
                        <div className="text-base font-black text-green-700">{item.present}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                        <div className="text-[10px] text-red-700 font-semibold uppercase">Absent</div>
                        <div className="text-base font-black text-red-700">{item.absent}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                        <div className="text-[10px] text-blue-700 font-semibold uppercase">Available</div>
                        <div className="text-base font-black text-blue-700">{item.available_seats}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/lecturer/live-view/${s.id}`)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Live Classroom Seating Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-blue-100 rounded-3xl shadow-xs">
            <p className="text-sm text-gray-600">No active attendance sessions currently running.</p>
            <button
              onClick={() => navigate('/lecturer/create-session')}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Start an Attendance Session Now
            </button>
          </div>
        )}
      </div>

      {/* Assigned Classes */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          <span>Assigned Classes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data?.assigned_classes?.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {cls.subject_code}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-2">{cls.class_name}</h4>
                <p className="text-xs text-gray-600">{cls.subject_name}</p>
                <div className="mt-3 text-xs text-gray-600">
                  Enrolled Students: <span className="font-bold text-gray-900">{cls.enrolled_students_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditClass(cls)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/lecturer/create-session?class_id=${cls.id}`)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClass(null);
        }}
        title={`Edit Class - ${editingClass?.class_name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Class Name
            </label>
            <input
              type="text"
              value={editFormData.class_name}
              onChange={(e) => setEditFormData({ ...editFormData, class_name: e.target.value })}
              placeholder="e.g. DS201 - Data Science Batch 2026"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="text"
                value={editFormData.semester}
                onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
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
                value={editFormData.academic_year}
                onChange={(e) => setEditFormData({ ...editFormData, academic_year: e.target.value })}
                placeholder="e.g. 2026"
                required
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingClass(null);
              }}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingClass}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {updatingClass ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
