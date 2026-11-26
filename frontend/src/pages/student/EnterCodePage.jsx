import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { KeyRound, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function EnterCodePage() {
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session_id');
  const codeParam = searchParams.get('code');

  const [code, setCode] = useState(codeParam || '');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionIdParam) {
      const fetchSession = async () => {
        setLoading(true);
        try {
          const res = await attendanceService.getSession(sessionIdParam);
          setSession(res);
        } catch (err) {
          console.error('Failed to load session info', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSession();
    }
  }, [sessionIdParam]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter the attendance code.');
      return;
    }

    setErrorMsg('');
    setVerifying(true);
    try {
      const result = await attendanceService.verifyCode(code.trim().toUpperCase(), session?.id || null);

      if (result.already_attended) {
        showToast('You have already marked attendance for this session!', 'info');
        navigate(`/student/confirmation?session_id=${result.session.id}`);
        return;
      }

      showToast('Attendance code verified successfully!', 'success');
      navigate(`/student/seat-reservation?session_id=${result.session.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please check the attendance code.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading session details..." />;
  }

  return (
    <div className="max-w-md mx-auto py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/student/select-class')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Class Selection</span>
      </button>

      <div className="p-8 rounded-3xl bg-white border border-blue-100 shadow-xl shadow-blue-500/10 space-y-6 text-center">
        {/* Icon & Title */}
        <div>
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/10">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Physical Attendance Code</h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter the active session code provided by your lecturer inside the classroom.
          </p>
        </div>

        {/* Target Session Details Card if known */}
        {session && (
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-left space-y-1">
            <div className="text-xs font-bold text-blue-700">{session.subject_code} - {session.subject_name}</div>
            <div className="text-sm font-bold text-gray-900">{session.class_name}</div>
            <div className="text-xs text-gray-500">Classroom: {session.classroom_name}</div>
          </div>
        )}

        {/* Code Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Enter Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMsg('');
              }}
              placeholder="e.g. DS201-8392"
              required
              autoFocus
              className="w-full text-center px-4 py-3.5 bg-blue-50/40 border border-blue-200 rounded-2xl text-xl font-mono font-bold tracking-widest text-blue-700 uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || !code.trim()}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {verifying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify & View Classroom Layout</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-[11px] text-gray-500">
          This code verifies your physical presence in the lecture hall.
        </div>
      </div>
    </div>
  );
}
