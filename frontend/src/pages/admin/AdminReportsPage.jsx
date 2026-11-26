import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { adminService } from '../../services/adminService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import AttendanceTable from '../../components/AttendanceTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Filter options lists
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  // Active filters
  const [reportType, setReportType] = useState('overall');
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();

  const loadFilterOptions = async () => {
    try {
      const [stuRes, subRes, clsRes, lecRes] = await Promise.all([
        adminService.getStudents(),
        adminService.getSubjects(),
        classService.getClasses(),
        adminService.getLecturers(),
      ]);
      setStudents(stuRes || []);
      setSubjects(subRes || []);
      setClasses(clsRes || []);
      setLecturers(lecRes || []);
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReportJson({
        type: reportType,
        student_id: studentId || undefined,
        subject_id: subjectId || undefined,
        class_id: classId || undefined,
        lecturer_id: lecturerId || undefined,
        status: status || undefined,
        search: searchQuery || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setReportData(data);
    } catch (err) {
      console.error('Failed to generate report', err);
      showToast('Failed to compile attendance report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadReport();
  }, [reportType, studentId, subjectId, classId, lecturerId, status]);

  const handleExportExcel = async () => {
    setDownloading(true);
    try {
      await reportService.exportExcel({
        type: reportType,
        student_id: studentId || undefined,
        subject_id: subjectId || undefined,
        class_id: classId || undefined,
        lecturer_id: lecturerId || undefined,
        status: status || undefined,
        search: searchQuery || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      showToast('Excel report downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to export Excel report.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPdf = async () => {
    setDownloading(true);
    try {
      await reportService.exportPdf({
        type: reportType,
        student_id: studentId || undefined,
        subject_id: subjectId || undefined,
        class_id: classId || undefined,
        lecturer_id: lecturerId || undefined,
        status: status || undefined,
        search: searchQuery || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      showToast('PDF report downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to export PDF report.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
            <FileBarChart className="w-7 h-7 text-blue-600" />
            <span>Attendance Reports & Export Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Generate and export official attendance reports by student, subject, class, lecturer, or date.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            disabled={downloading || loading}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-green-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={downloading || loading}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Panel */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Report Dimension Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              1. Report Dimension
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="overall">Overall Attendance Report</option>
              <option value="student">Student Attendance Report</option>
              <option value="subject">Subject Attendance Report</option>
              <option value="class">Class Attendance Report</option>
              <option value="daily">Daily Attendance Report</option>
              <option value="lecturer">Lecturer Class Report</option>
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              2. Filter Student
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.student_id} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              3. Filter Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subject_code} - {sub.subject_name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              4. Filter Class
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              5. Attendance Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          {/* Lecturer Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              6. Filter Lecturer
            </label>
            <select
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">All Lecturers</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lecturer_id} - {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              7. Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              8. End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Full text search on student name, student ID, subject..."
              className="w-full pl-9 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={loadReport}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Metrics Header */}
      {reportData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs">
            <div className="text-xs text-gray-600 font-semibold">Total Verified Records</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{reportData.total_records}</div>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 shadow-xs">
            <div className="text-xs text-green-700 font-semibold">Present Count</div>
            <div className="text-2xl font-black text-green-700 mt-1">{reportData.present_count}</div>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 shadow-xs">
            <div className="text-xs text-red-700 font-semibold">Absent Count</div>
            <div className="text-2xl font-black text-red-700 mt-1">{reportData.absent_count}</div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs">
            <div className="text-xs text-blue-700 font-semibold">Overall Attendance Rate</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{reportData.attendance_rate}%</div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="large" message="Compiling report data..." />
      ) : (
        <AttendanceTable records={reportData?.records || []} showStudent={true} />
      )}
    </div>
  );
}
