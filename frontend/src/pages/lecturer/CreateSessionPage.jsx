import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { lecturerService } from '../../services/lecturerService';
import { classroomService } from '../../services/classroomService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PlusCircle, Users, Sparkles, KeyRound, RefreshCw } from 'lucide-react';

export default function CreateSessionPage() {
  const [searchParams] = useSearchParams();
  const preselectedClassId = searchParams.get('class_id');

  const [classes, setClasses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [classId, setClassId] = useState(preselectedClassId || '');
  const [classroomId, setClassroomId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:30 AM');
  const [endTime, setEndTime] = useState('12:30 PM');
  const [startStudentId, setStartStudentId] = useState('');
  const [endStudentId, setEndStudentId] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [startImmediately, setStartImmediately] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [clsRes, crmRes] = await Promise.all([
          lecturerService.getMyClasses(),
          classroomService.getClassrooms(),
        ]);
        setClasses(clsRes || []);
        setClassrooms(crmRes || []);

        if (clsRes.length > 0 && !classId) {
          setClassId(clsRes[0].id.toString());
        }
        if (crmRes.length > 0) {
          setClassroomId(crmRes[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load classes or classrooms', err);
        showToast('Failed to load session prerequisites.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadPrerequisites();
  }, []);

  const handleGenerateRandomCode = () => {
    const selectedClass = classes.find((c) => c.id.toString() === classId.toString());
    const prefix = selectedClass?.subject_code || 'ATT';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setCustomCode(`${prefix}-${randomDigits}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId || !classroomId || !startTime || !endTime) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!customCode.trim()) {
      showToast('Please enter an attendance code.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await attendanceService.createSession({
        class_id: parseInt(classId),
        classroom_id: parseInt(classroomId),
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        attendance_code: customCode.trim().toUpperCase(),
        start_student_id: startStudentId.trim().toUpperCase() || undefined,
        end_student_id: endStudentId.trim().toUpperCase() || undefined,
      });

      const newSessionId = res.session.id;
      const createdCode = res.session.attendance_code || customCode.trim().toUpperCase();

      if (startImmediately) {
        await attendanceService.changeSessionStatus(newSessionId, 'OPEN');
        showToast(`Attendance session started! Code: ${createdCode}`, 'success');
        navigate(`/lecturer/live-view/${newSessionId}`);
      } else {
        showToast(`Attendance session created! Code: ${createdCode}`, 'success');
        navigate('/lecturer/sessions');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create attendance session.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading class and room configuration..." />;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>NEW ATTENDANCE SESSION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Create Attendance Session</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Set up a classroom session and enable live seating reservations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-5">
        {/* Class Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Select Class
          </label>
          <div className="relative">
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.subject_code} - {c.class_name} ({c.enrolled_students_count} Students)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Classroom Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Select Classroom
          </label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            required
            className="w-full px-4 py-3 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            {classrooms.map((crm) => (
              <option key={crm.id} value={crm.id}>
                {crm.room_name} ({crm.room_code}) - {crm.rows} Rows, {crm.total_seats_count} Seats
              </option>
            ))}
          </select>
        </div>

        {/* Date & Times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Start Time
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 10:30 AM"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              End Time
            </label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 12:30 PM"
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Allowed Student ID Range (Optional) */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Allowed Student ID Range <span className="text-gray-500 normal-case font-normal">(Optional)</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">From (e.g. DS001)</label>
              <input
                type="text"
                value={startStudentId}
                onChange={(e) => setStartStudentId(e.target.value.toUpperCase())}
                placeholder="DS001"
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase tracking-wider transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">To (e.g. DS050)</label>
              <input
                type="text"
                value={endStudentId}
                onChange={(e) => setEndStudentId(e.target.value.toUpperCase())}
                placeholder="DS050"
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase tracking-wider transition-all"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Only students whose ID falls within this range will be allowed to mark attendance. Leave both blank to allow all enrolled students.
          </p>
        </div>

        {/* Attendance Code */}
        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                Attendance Verification Code
              </label>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
              Visible Only to Lecturer
            </span>
          </div>

          <p className="text-[11px] text-gray-600">
            Students cannot see this code anywhere in the system. Share or announce it in class so attending students can verify their physical presence.
          </p>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="e.g. DS201-8392"
                required
                className="flex-1 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-mono font-bold text-gray-900 placeholder-gray-400 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGenerateRandomCode}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                title="Generate Random Code"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Random</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              Type your desired code or click Random to generate one based on the subject code.
            </p>
          </div>
        </div>

        {/* Start Immediately Toggle */}
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
          <input
            type="checkbox"
            id="startImmediately"
            checked={startImmediately}
            onChange={(e) => setStartImmediately(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-blue-300"
          />
          <label htmlFor="startImmediately" className="text-xs font-semibold text-blue-900 cursor-pointer">
            Open session immediately and launch Live Classroom Seating View
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/lecturer/sessions')}
            className="px-5 py-2.5 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Create & Start Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
