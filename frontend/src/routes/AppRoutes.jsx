import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import SelectClassPage from '../pages/student/SelectClassPage';
import EnterCodePage from '../pages/student/EnterCodePage';
import SeatReservationPage from '../pages/student/SeatReservationPage';
import AttendanceConfirmationPage from '../pages/student/AttendanceConfirmationPage';
import AttendanceHistoryPage from '../pages/student/AttendanceHistoryPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';

// Lecturer Pages
import LecturerDashboard from '../pages/lecturer/LecturerDashboard';
import SessionsPage from '../pages/lecturer/SessionsPage';
import CreateSessionPage from '../pages/lecturer/CreateSessionPage';
import LiveClassroomView from '../pages/lecturer/LiveClassroomView';
import LecturerAttendanceHistory from '../pages/lecturer/LecturerAttendanceHistory';
import LecturerReportsPage from '../pages/lecturer/LecturerReportsPage';

// Administrator Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import LecturerManagement from '../pages/admin/LecturerManagement';
import SubjectManagement from '../pages/admin/SubjectManagement';
import ClassManagement from '../pages/admin/ClassManagement';
import ClassroomManagement from '../pages/admin/ClassroomManagement';
import ClassroomSeatsConfig from '../pages/admin/ClassroomSeatsConfig';
import AdminAttendanceManagement from '../pages/admin/AdminAttendanceManagement';
import UserManagement from '../pages/admin/UserManagement';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

export default function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (role === 'LECTURER') return <Navigate to="/lecturer/dashboard" replace />;
    if (role === 'ADMINISTRATOR') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getDefaultRedirect()} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} />
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<MainLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/select-class" element={<SelectClassPage />} />
          <Route path="/student/enter-code" element={<EnterCodePage />} />
          <Route path="/student/seat-reservation" element={<SeatReservationPage />} />
          <Route path="/student/confirmation" element={<AttendanceConfirmationPage />} />
          <Route path="/student/history" element={<AttendanceHistoryPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>
      </Route>

      {/* Protected Lecturer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['LECTURER']} />}>
        <Route element={<MainLayout />}>
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/sessions" element={<SessionsPage />} />
          <Route path="/lecturer/create-session" element={<CreateSessionPage />} />
          <Route path="/lecturer/live-view/:sessionId" element={<LiveClassroomView />} />
          <Route path="/lecturer/history" element={<LecturerAttendanceHistory />} />
          <Route path="/lecturer/reports" element={<LecturerReportsPage />} />
        </Route>
      </Route>

      {/* Protected Administrator Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/lecturers" element={<LecturerManagement />} />
          <Route path="/admin/subjects" element={<SubjectManagement />} />
          <Route path="/admin/classes" element={<ClassManagement />} />
          <Route path="/admin/classrooms" element={<ClassroomManagement />} />
          <Route path="/admin/classrooms/:classroomId/seats" element={<ClassroomSeatsConfig />} />
          <Route path="/admin/attendance" element={<AdminAttendanceManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
