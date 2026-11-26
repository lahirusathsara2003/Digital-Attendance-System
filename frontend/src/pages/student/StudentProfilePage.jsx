import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Hash, Shield, GraduationCap } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const student = user?.profile;

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
          <User className="w-6 h-6 text-blue-600" />
          <span>Student Profile</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Your official academic profile registered in the classroom attendance system.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-blue-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {student?.name?.charAt(0) || user?.username?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student?.name || user?.username}</h2>
            <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">
              ID: {student?.student_id || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-gray-500 flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5 text-blue-600" /> Student Code
            </span>
            <p className="font-mono font-bold text-gray-900 text-sm">{student?.student_id || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-gray-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-green-600" /> Email Address
            </span>
            <p className="font-bold text-gray-900 text-sm truncate">{student?.email || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-gray-500 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> Phone Number
            </span>
            <p className="font-bold text-gray-900 text-sm">{student?.phone || 'Not provided'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-gray-500 flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Account Status
            </span>
            <p className="font-bold text-green-600 text-sm">{student?.status || user?.status || 'ACTIVE'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
