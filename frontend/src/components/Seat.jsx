import React, { useState } from 'react';
import { UserCheck, Lock, User, CheckCircle2, Clock } from 'lucide-react';

export default function Seat({
  seat,
  isSelected,
  onClick,
  isLecturerView = false,
  onLecturerClick = null,
  disabled = false,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const status = seat.session_status || seat.status || 'AVAILABLE';
  const isMySeat = seat.is_my_seat || seat.reserved_by_current_student;
  const attendanceStatus = seat.reservation?.attendance_status;

  // Determine styling based on state
  // Color coding:
  // - White: Available
  // - Blue: Selected
  // - Green: Your Seat / Present
  // - Red: Reserved / Absent
  // - Yellow: Late
  // - Black: Unavailable
  let statusStyle =
    'bg-white hover:bg-blue-50 text-black border-blue-200 shadow-md shadow-black/10 cursor-pointer hover:scale-105 active:scale-95 font-black';
  let icon = null;
  let cushionStyle = 'bg-blue-200';

  if (status === 'UNAVAILABLE') {
    statusStyle = 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
    icon = <Lock className="w-3 h-3 text-gray-400" />;
    cushionStyle = 'bg-gray-300';
  } else if (isSelected) {
    statusStyle =
      'bg-blue-600 border-blue-300 text-white ring-4 ring-blue-500/50 shadow-lg shadow-blue-900/60 scale-105 animate-pulse cursor-pointer font-bold';
    cushionStyle = 'bg-blue-300/40';
  } else if (isMySeat) {
    if (attendanceStatus === 'LATE') {
      statusStyle =
        'bg-yellow-400 border-yellow-300 text-slate-950 ring-2 ring-yellow-400/90 shadow-lg shadow-yellow-950/60 font-black cursor-default';
      icon = <Clock className="w-3 h-3 text-slate-950" />;
      cushionStyle = 'bg-yellow-600/30';
    } else {
      statusStyle =
        'bg-green-500 border-green-300 text-white ring-2 ring-green-400/90 shadow-lg shadow-green-950/60 font-black cursor-default';
      icon = <CheckCircle2 className="w-3 h-3 text-white" />;
      cushionStyle = 'bg-green-300/30';
    }
  } else if (isLecturerView && status === 'RESERVED') {
    if (attendanceStatus === 'LATE') {
      statusStyle =
        'bg-yellow-400 border-yellow-300 text-slate-950 shadow-yellow-950/40 cursor-pointer hover:brightness-110 font-bold';
      icon = <Clock className="w-3 h-3 text-slate-950" />;
      cushionStyle = 'bg-yellow-600/30';
    } else if (attendanceStatus === 'PRESENT') {
      statusStyle =
        'bg-green-500 border-green-400 text-white shadow-green-950/40 cursor-pointer hover:brightness-110 font-bold';
      icon = <CheckCircle2 className="w-3 h-3 text-white" />;
      cushionStyle = 'bg-green-300/30';
    } else {
      statusStyle =
        'bg-red-600 border-red-400 text-white shadow-red-950/40 cursor-pointer hover:brightness-110 font-bold';
      icon = <UserCheck className="w-3 h-3 text-red-200" />;
      cushionStyle = 'bg-red-400/30';
    }
  } else if (status === 'RESERVED') {
    statusStyle =
      'bg-red-600 border-red-400/80 text-white shadow-red-950/40 cursor-pointer hover:brightness-110 font-bold';
    icon = <UserCheck className="w-3 h-3 text-red-200" />;
    cushionStyle = 'bg-red-400/30';
  }

  if (disabled && status === 'AVAILABLE') {
    statusStyle = 'bg-blue-100 text-gray-500 border-blue-200 opacity-60 cursor-not-allowed';
    cushionStyle = 'bg-blue-200';
  }

  const isClickable = !disabled && (status === 'AVAILABLE' || (isLecturerView && status === 'RESERVED'));

  const handleClick = () => {
    if (!isClickable) return;
    if (isLecturerView && status === 'RESERVED' && onLecturerClick) {
      onLecturerClick(seat);
    } else if (status === 'AVAILABLE' && onClick) {
      onClick(seat);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        disabled={!isClickable}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition-all duration-150 relative ${statusStyle}`}
        title={`Seat ${seat.seat_number} - ${status}`}
      >
        {/* Top small cushion detail or icon */}
        {icon ? (
          <span className="mb-0.5">{icon}</span>
        ) : (
          <span className={`w-5 h-1 rounded-full mb-0.5 ${cushionStyle}`} />
        )}
        
        {/* Seat Number */}
        <span className="leading-none text-xs sm:text-sm tracking-tight">{seat.seat_number}</span>
      </button>

      {/* Tooltip for hover details */}
      {showTooltip && (status === 'RESERVED' || seat.reservation || isMySeat) && (
        <div className="absolute -top-16 z-30 px-3 py-2 bg-white border border-blue-200 rounded-xl shadow-xl text-[11px] text-gray-800 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
          {isMySeat ? (
            <>
              <div className="font-bold text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Your Reserved Seat ({attendanceStatus || 'PRESENT'})</span>
              </div>
              <div className="text-[10px] text-gray-500">
                {seat.reservation?.attendance_time ? `Marked at ${seat.reservation.attendance_time}` : 'Attendance Recorded'}
              </div>
            </>
          ) : (
            <>
              <div className="font-semibold text-red-700 flex items-center gap-1">
                <User className="w-3 h-3 text-red-600" />
                {seat.reservation?.student_name || 'Reserved'} ({seat.reservation?.student_code || 'N/A'})
              </div>
              <div className="text-[10px] text-gray-500">
                {attendanceStatus && (
                  <span className={attendanceStatus === 'LATE' ? 'text-yellow-600 font-bold' : attendanceStatus === 'PRESENT' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {attendanceStatus} • 
                  </span>
                )}
                {seat.reservation?.attendance_time ? ` Marked at ${seat.reservation.attendance_time}` : ' Attendance Recorded'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
