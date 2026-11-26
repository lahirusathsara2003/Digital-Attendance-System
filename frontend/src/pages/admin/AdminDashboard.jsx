import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  Building2,
  CalendarCheck,
  Radio,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" message="Loading administrator dashboard..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/15">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administrator Dashboard</h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
          Complete management overview of students, lecturers, classrooms, layout configuration, and verified attendance analytics.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <DashboardCard
          title="Students"
          value={data?.total_students || 0}
          icon={GraduationCap}
          color="indigo"
        />
        <DashboardCard
          title="Lecturers"
          value={data?.total_lecturers || 0}
          icon={Users}
          color="indigo"
        />
        <DashboardCard
          title="Subjects"
          value={data?.total_subjects || 0}
          icon={BookOpen}
          color="indigo"
        />
        <DashboardCard
          title="Classes"
          value={data?.total_classes || 0}
          icon={School}
          color="indigo"
        />
        <DashboardCard
          title="Classrooms"
          value={data?.total_classrooms || 0}
          icon={Building2}
          color="indigo"
        />
        <DashboardCard
          title="Active Live"
          value={data?.active_sessions || 0}
          icon={Radio}
          color="indigo"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance by Subject Bar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Attendance Volume by Subject</span>
            </h3>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.subject_statistics || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="subject_code" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#bfdbfe',
                    borderRadius: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                  }}
                />
                <Bar dataKey="attendance_count" name="Attendance Count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trend Line Chart */}
        <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>7-Day Attendance Trend</span>
            </h3>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.date_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#bfdbfe',
                    borderRadius: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="present"
                  name="Verified Present"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563eb' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
