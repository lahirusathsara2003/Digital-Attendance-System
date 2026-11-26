import React from 'react';
import Seat from './Seat';
import { Monitor, ArrowDown } from 'lucide-react';

export default function SeatMap({
  classroom,
  seats = [],
  selectedSeat = null,
  onSelectSeat = null,
  isLecturerView = false,
  onLecturerSeatClick = null,
  disabled = false,
}) {
  if (!classroom || !seats || seats.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-blue-100 shadow-xs">
        <p className="text-gray-600">No seat layout configured for this classroom.</p>
      </div>
    );
  }

  const numRows = classroom.rows || 5;
  const leftCols = classroom.left_block_columns || 6;
  const rightCols = classroom.right_block_columns || 7;

  // Group seats by row and block
  const seatGrid = {};
  for (let r = 1; r <= numRows; r++) {
    seatGrid[r] = { left: [], right: [] };
  }

  seats.forEach((s) => {
    const row = s.row_number;
    if (seatGrid[row]) {
      if (s.block === 'LEFT' || (!s.block && s.column_number <= leftCols)) {
        seatGrid[row].left.push(s);
      } else {
        seatGrid[row].right.push(s);
      }
    }
  });

  // Sort seats in each block row by column
  Object.keys(seatGrid).forEach((r) => {
    seatGrid[r].left.sort((a, b) => a.column_number - b.column_number);
    seatGrid[r].right.sort((a, b) => a.column_number - b.column_number);
  });

  return (
    <div className="w-full flex flex-col items-center select-none overflow-x-auto py-6">
      {/* Front Stage / Screen */}
      <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="w-full h-11 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border border-blue-200 rounded-xl flex items-center justify-center space-x-2 shadow-xs">
          <Monitor className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold tracking-widest text-blue-800 uppercase">
            Front of Classroom / Whiteboard & Lecturer Podium
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-gray-500 mt-1.5 font-medium">
          <ArrowDown className="w-3 h-3 text-gray-500" />
          <span>Screen View Direction</span>
          <ArrowDown className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Classroom Seating Grid with Left & Right Blocks */}
      <div className="inline-flex flex-col space-y-4 p-6 bg-white border border-blue-100 rounded-3xl shadow-sm min-w-max">
        {/* Block Header Labels */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-x-4 px-2 mb-1">
          <div className="w-8" />
          <div className="text-center font-bold text-xs tracking-wider text-green-700 uppercase py-1 bg-green-50 rounded-lg border border-green-200">
            LEFT BLOCK ({leftCols} Seats/Row)
          </div>
          <div className="w-12 text-center text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            AISLE
          </div>
          <div className="text-center font-bold text-xs tracking-wider text-blue-700 uppercase py-1 bg-blue-50 rounded-lg border border-blue-200">
            RIGHT BLOCK ({rightCols} Seats/Row)
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: numRows }, (_, idx) => idx + 1).map((rowNum) => {
          const rowData = seatGrid[rowNum] || { left: [], right: [] };

          return (
            <div key={rowNum} className="flex items-center space-x-4">
              {/* Row Label */}
              <div className="w-8 text-right font-bold text-xs text-gray-600 tracking-wider">
                R{rowNum}
              </div>

              {/* Left Block Seats */}
              <div
                className="grid gap-2.5 p-2.5 bg-blue-50/30 border border-blue-100/80 rounded-2xl"
                style={{ gridTemplateColumns: `repeat(${leftCols}, minmax(0, 1fr))` }}
              >
                {rowData.left.map((seat) => (
                  <Seat
                    key={seat.id || seat.seat_number}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    onClick={onSelectSeat}
                    isLecturerView={isLecturerView}
                    onLecturerClick={onLecturerSeatClick}
                    disabled={disabled}
                  />
                ))}
              </div>

              {/* Central Aisle */}
              <div className="w-12 h-full flex flex-col items-center justify-center py-2">
                <div className="h-full border-r-2 border-dashed border-blue-200 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-gray-500 rotate-90 whitespace-nowrap">
                    WALKWAY
                  </span>
                </div>
              </div>

              {/* Right Block Seats */}
              <div
                className="grid gap-2.5 p-2.5 bg-blue-50/30 border border-blue-100/80 rounded-2xl"
                style={{ gridTemplateColumns: `repeat(${rightCols}, minmax(0, 1fr))` }}
              >
                {rowData.right.map((seat) => (
                  <Seat
                    key={seat.id || seat.seat_number}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    onClick={onSelectSeat}
                    isLecturerView={isLecturerView}
                    onLecturerClick={onLecturerSeatClick}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
