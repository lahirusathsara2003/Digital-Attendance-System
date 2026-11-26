import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Hash,
} from 'lucide-react';

export default function Signup() {
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    student_id: '',
    lecturer_id: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      username,
      email,
      phone,
      student_id,
      lecturer_id,
      password,
      confirmPassword,
    } = formData;

    // Basic client validations
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (role === 'STUDENT' && !student_id.trim()) {
      showToast('Please provide your Student ID.', 'error');
      return;
    }

    if (role === 'LECTURER' && !lecturer_id.trim()) {
      showToast('Please provide your Lecturer ID.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      const profileData =
        role === 'STUDENT'
          ? {
              student_id: student_id.trim(),
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
            }
          : {
              lecturer_id: lecturer_id.trim(),
              name: name.trim(),
              email: email.trim(),
            };

      const payload = {
        username: username.trim(),
        password: password.trim(),
        role,
        profile: profileData,
      };

      await register(payload);
      showToast(`Account created successfully! Welcome, ${name.trim()}!`, 'success');

      // Direct redirection to corresponding dashboard
      if (role === 'STUDENT') {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'LECTURER') {
        navigate('/lecturer/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Registration failed. Please check the details entered.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 border border-blue-100 rounded-3xl p-8 shadow-xl shadow-blue-500/10 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/25 mb-3">
          <UserPlus className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create an Account</h2>
        <p className="text-xs text-blue-600 mt-1 font-semibold">
          Join the Digital Attendance System
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-blue-50/80 rounded-2xl border border-blue-100 mb-6">
        <button
          type="button"
          onClick={() => setRole('STUDENT')}
          className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            role === 'STUDENT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-blue-800 hover:text-blue-900 hover:bg-blue-100/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>I'm a Student</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('LECTURER')}
          className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            role === 'LECTURER'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-blue-800 hover:text-blue-900 hover:bg-blue-100/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>I'm a Lecturer</span>
        </button>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={role === 'STUDENT' ? 'e.g. Kasun Perera' : 'e.g. Dr. Sunil Silva'}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Username & Role ID in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                <span className="text-xs font-bold text-blue-500">@</span>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. kasunp"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {role === 'STUDENT' ? 'Student ID' : 'Lecturer ID'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name={role === 'STUDENT' ? 'student_id' : 'lecturer_id'}
                value={role === 'STUDENT' ? formData.student_id : formData.lecturer_id}
                onChange={handleChange}
                placeholder={role === 'STUDENT' ? 'e.g. IT21001234' : 'e.g. LEC101'}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={role === 'LECTURER' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {role === 'STUDENT' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone <span className="text-gray-400 text-[10px] font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0771234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign Up as {role === 'STUDENT' ? 'Student' : 'Lecturer'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 pt-5 border-t border-blue-100 text-center">
        <p className="text-xs text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
