import React from 'react';

export default function SeatLegend({ showSelected = true, showMySeat = true }) {
  const legendItems = [
    { label: 'Available', color: 'bg-white border-blue-200 text-black shadow-sm' },
    ...(showSelected ? [{ label: 'Selected', color: 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400 shadow-blue-950/50' }] : []),
    ...(showMySeat ? [{ label: 'Your Seat / Present', color: 'bg-green-500 border-green-400 text-white ring-2 ring-green-400/90 shadow-green-950/60' }] : []),
    { label: 'Reserved / Absent', color: 'bg-red-600 border-red-500 text-white shadow-red-950/40' },
    { label: 'Late', color: 'bg-yellow-400 border-yellow-300 text-slate-950 shadow-yellow-950/40' },
    { label: 'Unavailable', color: 'bg-gray-100 border-gray-300 text-gray-500' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 py-3 bg-white border border-blue-100 rounded-2xl shadow-xs">
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mr-1">Legend:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center space-x-2">
          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center font-bold text-[10px] shadow-sm ${item.color}`} />
          <span className="text-xs font-medium text-gray-800">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
