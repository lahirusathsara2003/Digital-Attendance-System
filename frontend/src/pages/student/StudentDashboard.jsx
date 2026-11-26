import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import DashboardCard from '../../components/DashboardCard';
import ClassCard from '../../components/ClassCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Percent,
  CheckCircle,
  XCircle,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Armchair,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentService.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" message="Loading student dashboard..." />;
  }

  const student = data?.student || user?.profile;
  const attendanceRate = data?.attendance_percentage || 0;
  const presentCount = data?.classes_attended || 0;
  const absentCount = data?.classes_missed || 0;

  const pieData = [
    { name: 'Present', value: presentCount, color: '#10B981' },
    { name: 'Absent', value: absentCount, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PHYSICAL CLASSROOM ATTENDANCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {student?.name || user?.username}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
              Student ID: <span className="font-mono text-white font-bold">{student?.student_id || 'N/A'}</span> • {student?.email}
            </p>
          </div>

          <button
            onClick={() => navigate('/student/select-class')}
            className="px-6 py-3.5 bg-white hover:bg-blue-50 active:scale-[0.98] text-blue-700 font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Armchair className="w-5 h-5 text-blue-600" />
            <span>Reserve Seat & Self-Attend</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Overall Attendance"
          value={`${attendanceRate}%`}
          subtitle="Minimum required: 80%"
          icon={Percent}
          color="emerald"
        />
        <DashboardCard
          title="Classes Attended"
          value={presentCount}
          subtitle="Total verified sessions"
          icon={CheckCircle}
          color="indigo"
        />
        <DashboardCard
          title="Classes Missed"
          value={absentCount}
          subtitle="Unmarked or absent"
          icon={XCircle}
          color="rose"
        />
        <DashboardCard
          title="Enrolled Subjects"
          value={data?.enrolled_classes?.length || 0}
          subtitle="Active semester classes"
          icon={BookOpen}
          color="cyan"
        />
      </div>

      {/* Today's Active Classes & Subject-Wise Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Today's Classes & Sessions</span>
            </h3>
          </div>

          {data?.today_classes && data.today_classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.today_classes.map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {session.subject_code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          session.status === 'OPEN'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">{session.class_name}</h4>
                    <p className="text-xs text-gray-500">Room: {session.classroom_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Time: {session.start_time} - {session.end_time}
                    </p>
                  </div>

                  <div>
                    {session.is_attended ? (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Attendance Recorded (Present)</span>
                      </div>
                    ) : session.status === 'OPEN' ? (
                      <button
                        onClick={() => navigate(`/student/enter-code?session_id=${session.id}`)}
                        className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Armchair className="w-4 h-4" />
                        <span>Enter Code & Reserve Seat</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 text-center text-xs text-gray-500 font-medium">
                        Session is {session.status.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-blue-100 rounded-3xl shadow-xs">
              <p className="text-sm text-gray-500">No classroom sessions scheduled for today.</p>
              <button
                onClick={() => navigate('/student/select-class')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                View Enrolled Classes
              </button>
            </div>
          )}

          {/* Subject-wise progress cards */}
          <div className="pt-4 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Subject Attendance Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.subject_statistics?.map((subj) => (
                <div
                  key={subj.class_id}
                  className="p-5 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{subj.subject_name}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        subj.percentage >= 80
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {subj.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-blue-50 border border-blue-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        subj.percentage >= 80 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, subj.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>Attended: {subj.attended}</span>
                    <span>Missed: {subj.missed}</span>
                    <span>Total: {subj.total_sessions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Ratio Chart */}
        <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 w-full text-left mb-2">
            Attendance Breakdown
          </h3>

          <div className="w-full h-52 flex items-center justify-center">
            {presentCount + absentCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-500 text-center">
                No session attendance records yet.
              </div>
            )}
          </div>

          <div className="w-full space-y-2 pt-2 border-t border-blue-100">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-2 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span>Present</span>
              </span>
              <span className="font-bold text-gray-900">{presentCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-2 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span>Absent / Missed</span>
              </span>
              <span className="font-bold text-gray-900">{absentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
