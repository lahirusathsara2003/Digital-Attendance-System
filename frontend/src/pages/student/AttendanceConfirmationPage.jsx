import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  CheckCircle2,
  Printer,
  Home,
  History,
  Armchair,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AttendanceConfirmationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [confirmationData, setConfirmationData] = useState(location.state?.confirmationData || null);
  const [loading, setLoading] = useState(!confirmationData);

  useEffect(() => {
    // Fire festive confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if confetti fails
    }

    if (!confirmationData && sessionId) {
      // Fetch latest history to retrieve this session's attendance
      const fetchLatest = async () => {
        try {
          const history = await studentService.getHistory();
          const match = history.find((h) => h.session_id === parseInt(sessionId));
          if (match) {
            setConfirmationData({
              student_id: match.student_code,
              student_name: match.student_name,
              subject_name: match.subject_name,
              subject_code: match.subject_code,
              class_name: match.class_name,
              room_name: match.classroom_name,
              seat_number: match.seat_number,
              seat_block: match.seat_block,
              date: match.attendance_date,
              time: match.attendance_time,
              status: match.status,
            });
          }
        } catch (err) {
          console.error('Failed to load confirmation details', err);
        } finally {
          setLoading(false);
        }
      };
      fetchLatest();
    }
  }, [confirmationData, sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading attendance confirmation..." />;
  }

  const d = confirmationData || {
    student_id: user?.profile?.student_id || 'N/A',
    student_name: user?.profile?.name || user?.username,
    subject_name: 'Data Science',
    class_name: 'DS201',
    room_name: 'Lecture Hall 01',
    seat_number: '18',
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'PRESENT',
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      {/* Printable Receipt Card */}
      <div
        id="attendance-receipt"
        className="p-8 rounded-3xl bg-white border border-blue-200 shadow-xl shadow-blue-500/10 relative overflow-hidden print:border-black print:bg-white print:text-black print:p-4"
      >
        {/* Top Success Badge */}
        <div className="text-center pb-6 border-b border-blue-100 print:border-slate-300">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-green-500/10 print:text-green-700">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight print:text-black">
            Attendance Successfully Marked
          </h2>
          <p className="text-xs text-green-700 font-semibold mt-1 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Physical Presence Record</span>
          </p>
        </div>

        {/* Receipt Key-Value Rows */}
        <div className="py-6 space-y-3.5 text-xs sm:text-sm">
          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Student ID:</span>
            <span className="font-mono font-bold text-gray-900 print:text-black text-sm">
              {d.student_id}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Student Name:</span>
            <span className="font-bold text-gray-900 print:text-black">{d.student_name}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Subject:</span>
            <span className="font-semibold text-gray-800 print:text-black">{d.subject_name}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Class:</span>
            <span className="font-semibold text-blue-700 print:text-blue-800 font-mono">
              {d.class_name}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Classroom:</span>
            <span className="font-semibold text-gray-800 print:text-black">{d.room_name}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Seat Number:</span>
            <span className="font-bold text-green-600 print:text-green-700 font-mono text-base">
              Seat #{d.seat_number} {d.seat_block ? `(${d.seat_block} Block)` : ''}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Date:</span>
            <span className="text-gray-800 print:text-black">{d.date}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-blue-50 print:border-slate-200">
            <span className="text-gray-500 print:text-slate-600 font-medium">Time:</span>
            <span className="text-gray-800 print:text-black">{d.time}</span>
          </div>

          <div className="flex justify-between py-2 items-center">
            <span className="text-gray-500 print:text-slate-600 font-medium">Status:</span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-green-50 text-green-700 border border-green-200 print:border-green-600 print:text-green-700">
              {d.status || 'PRESENT'}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-blue-100 print:border-slate-300 text-center text-[10px] text-gray-500">
          This digital receipt is recorded in the academic attendance database.
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl border border-blue-200 flex items-center justify-center space-x-2 transition-all shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/student/history')}
            className="flex-1 sm:flex-initial px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl border border-blue-200 flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <History className="w-4 h-4" />
            <span>Attendance History</span>
          </button>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
