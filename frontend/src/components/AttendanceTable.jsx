import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AttendanceTable({ records = [], onEdit = null, showStudent = true }) {
  if (!records || records.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-blue-100 shadow-xs">
        <p className="text-gray-600 text-sm">No attendance records found.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === 'PRESENT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Present
        </span>
      );
    } else if (status === 'LATE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Clock className="w-3.5 h-3.5 text-yellow-600" /> Late
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-3.5 h-3.5 text-red-600" /> Absent
        </span>
      );
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-xs">
      <table className="w-full text-left text-xs sm:text-sm text-gray-800">
        <thead className="bg-blue-50/50 text-gray-600 font-semibold uppercase tracking-wider text-[11px] border-b border-blue-100">
          <tr>
            {showStudent && <th className="px-4 py-3.5">Student</th>}
            <th className="px-4 py-3.5">Subject & Class</th>
            <th className="px-4 py-3.5">Room & Seat</th>
            <th className="px-4 py-3.5">Date & Time</th>
            <th className="px-4 py-3.5 text-center">Status</th>
            {onEdit && <th className="px-4 py-3.5 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-50">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-blue-50/50 transition-colors">
              {showStudent && (
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-gray-900">{r.student_name || 'N/A'}</div>
                  <div className="text-[11px] text-gray-600">{r.student_code || ''}</div>
                </td>
              )}
              <td className="px-4 py-3.5">
                <div className="font-medium text-gray-900">{r.subject_name || 'Subject'}</div>
                <div className="text-[11px] text-gray-600">{r.class_name || ''}</div>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-medium text-gray-900">{r.classroom_name || 'Hall'}</span>
                <span className="ml-2 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs border border-blue-200">
                  Seat {r.seat_number || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-gray-900 font-medium">{r.attendance_date}</div>
                <div className="text-[11px] text-gray-600">{r.attendance_time}</div>
              </td>
              <td className="px-4 py-3.5 text-center">{getStatusBadge(r.status)}</td>
              {onEdit && (
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => onEdit(r)}
                    className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
