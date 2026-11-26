import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Armchair,
  History,
  User,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Building2,
  CalendarCheck,
  FileBarChart,
  ShieldAlert,
  PlusCircle,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/select-class', label: 'Reserve Seat & Attend', icon: Armchair },
    { to: '/student/history', label: 'Attendance History', icon: History },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const lecturerLinks = [
    { to: '/lecturer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/lecturer/sessions', label: 'Attendance Sessions', icon: CalendarCheck },
    { to: '/lecturer/create-session', label: 'Start New Session', icon: PlusCircle },
    { to: '/lecturer/history', label: 'Attendance Records', icon: History },
    { to: '/lecturer/reports', label: 'Reports & Export', icon: FileBarChart },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/lecturers', label: 'Lecturers', icon: Users },
    { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/admin/classes', label: 'Classes & Enrollments', icon: School },
    { to: '/admin/classrooms', label: 'Classrooms & Seats', icon: Building2 },
    { to: '/admin/attendance', label: 'Attendance Records', icon: CalendarCheck },
    { to: '/admin/users', label: 'User Accounts', icon: ShieldAlert },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: FileBarChart },
  ];

  let links = [];
  if (role === 'STUDENT') links = studentLinks;
  else if (role === 'LECTURER') links = lecturerLinks;
  else if (role === 'ADMINISTRATOR') links = adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-blue-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-blue-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header on mobile */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-100 lg:hidden">
          <span className="font-bold text-gray-900 text-lg">Menu</span>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            Navigation
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-blue-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-blue-100 bg-blue-50">
          <div className="px-3 py-2 rounded-xl bg-white border border-blue-200 text-[11px] text-gray-700 shadow-xs">
            <p className="font-semibold text-gray-900">Digital Attendance System</p>
            <p className="text-[10px] text-gray-600 mt-0.5">Physical Presence & Attendance</p>
          </div>
        </div>
      </aside>
    </>
  );
}
