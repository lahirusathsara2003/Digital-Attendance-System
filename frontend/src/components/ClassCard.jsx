import React from 'react';
import { BookOpen, User, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function ClassCard({
  classItem,
  onAction,
  actionText = 'Select Class',
  badgeText = null,
  badgeColor = 'emerald',
}) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5">
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {classItem.subject_code || 'CODE'}
          </span>
          {badgeText && (
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                badgeColor === 'emerald'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{classItem.class_name}</h4>
        <p className="text-xs text-gray-500 mb-4">{classItem.subject_name}</p>

        <div className="space-y-2 text-xs text-gray-700">
          {classItem.lecturer_name && (
            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Lecturer: {classItem.lecturer_name}</span>
            </div>
          )}
          {classItem.room_name && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span>Room: {classItem.room_name}</span>
            </div>
          )}
          {classItem.start_time && (
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {classItem.start_time} - {classItem.end_time}
              </span>
            </div>
          )}
        </div>
      </div>

      {onAction && (
        <button
          onClick={() => onAction(classItem)}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
