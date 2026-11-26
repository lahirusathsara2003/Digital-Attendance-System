import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BookOpen, Armchair, ArrowRight, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';

export default function SelectClassPage() {
  const [data, setData] = useState(null);
  const [openSessions, setOpenSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [directCode, setDirectCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashRes, sessRes, histRes] = await Promise.all([
          studentService.getDashboard(),
          attendanceService.getSessions({ status: 'OPEN' }),
          studentService.getHistory(),
        ]);
        setData(dashRes);
        setOpenSessions(sessRes || []);
        setHistory(histRes || []);
      } catch (err) {
        console.error('Failed to load class selection data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDirectCodeSubmit = (e) => {
    e.preventDefault();
    if (directCode.trim()) {
      navigate(`/student/enter-code?code=${encodeURIComponent(directCode.trim().toUpperCase())}`);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading your classes..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 1: SELECT ACTIVE CLASS OR ENTER CODE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Join Classroom Attendance</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Select your current ongoing class or type the temporary attendance code displayed by your lecturer.
        </p>
      </div>

      {/* Direct Code Input Banner */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs">
        <form onSubmit={handleDirectCodeSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto text-gray-600">
            <KeyRound className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Have the Attendance Code?</p>
              <p className="text-[11px] text-gray-500">Enter code directly to proceed to seat map</p>
            </div>
          </div>
          <div className="flex-1 w-full flex gap-3">
            <input
              type="text"
              value={directCode}
              onChange={(e) => setDirectCode(e.target.value)}
              placeholder="e.g. DS201-8392"
              className="flex-1 px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm font-mono font-bold text-blue-700 placeholder-gray-400 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!directCode.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Verify Code
            </button>
          </div>
        </form>
      </div>

      {/* Active Open Sessions for Enrolled Classes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <Armchair className="w-5 h-5 text-blue-600" />
          <span>Currently Active Sessions (Open for Attendance)</span>
        </h3>

        {openSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openSessions.map((session) => {
              const attendedRecord = history.find(
                (h) => h.session_id === session.id || (h.class_name === session.class_name && h.attendance_date === session.session_date)
              );
              const isAttended = Boolean(attendedRecord);

              return (
                <div
                  key={session.id}
                  className={`p-6 rounded-3xl transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                    isAttended
                      ? 'bg-white border-2 border-blue-200'
                      : 'bg-white border-2 border-green-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {isAttended ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span>ATTENDANCE MARKED (SEAT #{attendedRecord.seat_number})</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200 animate-pulse">
                          ● LIVE ATTENDANCE OPEN
                        </span>
                      )}
                      <span className="text-xs font-mono text-gray-500">{session.session_date}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{session.class_name}</h4>
                    <p className="text-xs text-gray-500">
                      Subject: <span className="font-semibold text-gray-800">{session.subject_name}</span> ({session.subject_code})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Classroom: <span className="font-semibold text-gray-800">{session.classroom_name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Scheduled: {session.start_time} - {session.end_time}
                    </p>
                    {(session.start_student_id || session.end_student_id) && (
                      <p className="text-xs font-mono text-amber-700 mt-2 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 inline-block">
                        Allowed IDs: <b>{session.start_student_id || '—'}</b> → <b>{session.end_student_id || '—'}</b>
                      </p>
                    )}
                  </div>

                  {isAttended ? (
                    <button
                      onClick={() => navigate(`/student/confirmation?session_id=${session.id}`)}
                      className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>View Confirmed Receipt (Seat #{attendedRecord.seat_number})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/enter-code?session_id=${session.id}`)}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                    >
                      <span>Select & Enter Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-blue-100 rounded-3xl shadow-xs">
            <p className="text-sm text-gray-500">
              No classes have an open attendance session right now.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your lecturer must start and open the session first to generate the temporary code.
            </p>
          </div>
        )}
      </div>

      {/* Enrolled Classes List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>All Enrolled Classes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data?.enrolled_classes?.map((enr) => (
            <div
              key={enr.id}
              className="p-5 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {enr.subject_code}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-2">{enr.class_name}</h4>
                <p className="text-xs text-gray-500">{enr.subject_name}</p>
              </div>
              <div className="text-[11px] text-gray-500">
                Enrolled: {enr.enrolled_at ? new Date(enr.enrolled_at).toLocaleDateString() : 'Active'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
