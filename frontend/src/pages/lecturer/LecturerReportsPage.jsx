import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import AttendanceTable from '../../components/AttendanceTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Search,
  RotateCcw,
  CalendarDays,
  User,
  Layers,
} from 'lucide-react';

export default function LecturerReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Filters
  const [reportType, setReportType] = useState('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [exactDate, setExactDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const { showToast } = useToast();

  // Load sessions list for the dropdown
  useEffect(() => {
    attendanceService.getSessions().then((data) => setSessions(data || [])).catch(() => {});
  }, []);

  const buildParams = () => ({
    type: reportType,
    session_id: sessionId || undefined,
    student_search: studentSearch.trim() || undefined,
    search: searchQuery.trim() || undefined,
    exact_date: exactDate || undefined,
    start_date: (!exactDate && startDate) ? startDate : undefined,
    end_date: (!exactDate && endDate) ? endDate : undefined,
    status: status || undefined,
  });

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getReportJson(buildParams());
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report data', err);
      showToast('Failed to load report data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, status]);

  const handleReset = () => {
    setStudentSearch('');
    setSessionId('');
    setExactDate('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setStatus('');
    setReportType('overall');
  };

  const handleExportExcel = async () => {
    setDownloading(true);
    try {
      await reportService.exportExcel(buildParams());
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
      await reportService.exportPdf(buildParams());
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
            <span>Attendance Reports &amp; Export</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Filter by session, student, or date — then export to PDF or Excel.
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

      {/* Filter Control Box */}
      <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-5">

        {/* Row 1 — Report Type + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Report Type
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
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Status Filter
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
        </div>

        {/* Divider */}
        <div className="border-t border-blue-100" />

        {/* Row 2 — Session Filter */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter by Session</span>
          </label>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.status}] {s.class_name} — {s.session_date} {s.start_time}–{s.end_time}
                {s.attendance_code ? ` (${s.attendance_code})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3 — Student Filter */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter by Student</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Student name or ID (e.g. DS001 or John)"
              className="w-full pl-9 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Row 4 — Date Filters */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter by Date</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">Exact Date</label>
              <input
                type="date"
                value={exactDate}
                onChange={(e) => { setExactDate(e.target.value); setStartDate(''); setEndDate(''); }}
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                disabled={!!exactDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                disabled={!!exactDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-40"
              />
            </div>
          </div>
          {exactDate && (
            <p className="text-[10px] text-blue-600 mt-1.5 font-medium">
              Exact date selected — start/end date range is disabled.
            </p>
          )}
        </div>

        {/* Row 5 — General Search + Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-blue-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="General search: subject, class name..."
              className="w-full pl-9 pr-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={loadReport}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {reportData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs">
            <div className="text-xs text-gray-600 font-semibold">Total Records</div>
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
            <div className="text-xs text-blue-700 font-semibold">Attendance Rate</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{reportData.attendance_rate}%</div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {loading ? (
        <LoadingSpinner size="large" message="Compiling report data..." />
      ) : (
        <AttendanceTable records={reportData?.records || []} showStudent={true} />
      )}
    </div>
  );
}
