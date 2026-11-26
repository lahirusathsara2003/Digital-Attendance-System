import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LogIn, Lock, User, Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please enter both username and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username.trim(), password.trim());
      showToast(`Welcome back, ${data.user?.profile?.name || data.user?.username}!`, 'success');

      const userRole = data.user?.role;
      const redirectPath =
        location.state?.from?.pathname ||
        (userRole === 'STUDENT'
          ? '/student/dashboard'
          : userRole === 'LECTURER'
          ? '/lecturer/dashboard'
          : '/admin/dashboard');

      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="bg-white/95 border border-blue-100 rounded-3xl p-8 shadow-xl shadow-blue-500/10 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/25 mb-4">
          <LogIn className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Digital Attendance System</h2>
        <p className="text-xs text-blue-600 mt-1 font-semibold">
          Physical Seat Reservation & Self-Attendance
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. student1, lecturer1, admin"
              required
              className="w-full pl-10 pr-4 py-3 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-3 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4"
            >
              Sign Up here
            </Link>
          </p>
        </div>
      </form>

      {/* Quick Demo Credentials */}
      <div className="mt-8 pt-6 border-t border-blue-100">
        <div className="flex items-center space-x-1.5 text-gray-600 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Demo Login:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('student1', 'password123')}
            className="p-2.5 text-left rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 hover:border-blue-300 transition-all text-xs group"
          >
            <div className="font-bold text-blue-700 group-hover:underline">Student</div>
            <div className="text-[10px] text-blue-500 font-mono">student1</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('lecturer1', 'password123')}
            className="p-2.5 text-left rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 hover:border-blue-300 transition-all text-xs group"
          >
            <div className="font-bold text-blue-700 group-hover:underline">Lecturer</div>
            <div className="text-[10px] text-blue-500 font-mono">lecturer1</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin', 'admin123')}
            className="p-2.5 text-left rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 hover:border-blue-300 transition-all text-xs group"
          >
            <div className="font-bold text-blue-700 group-hover:underline">Admin</div>
            <div className="text-[10px] text-blue-500 font-mono">admin</div>
          </button>
        </div>
      </div>
    </div>
  );
}
