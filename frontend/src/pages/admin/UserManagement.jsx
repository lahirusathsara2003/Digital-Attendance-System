import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShieldAlert,
  Search,
  Filter,
  KeyRound,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Password reset modal
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('password123');

  const { showToast } = useToast();

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers(roleFilter);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users', err);
      showToast('Failed to load user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.toggleUserStatus(user.id, nextStatus);
      showToast(`User ${user.username} is now ${nextStatus}.`, 'success');
      loadUsers();
    } catch (err) {
      showToast('Failed to toggle status.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resettingUser) return;
    try {
      await adminService.resetUserPassword(resettingUser.id, newPassword);
      showToast(`Password for ${resettingUser.username} reset successfully!`, 'success');
      setResettingUser(null);
      setNewPassword('password123');
    } catch (err) {
      showToast('Failed to reset password.', 'error');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !searchTerm ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner size="large" message="Loading user accounts..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center space-x-2">
          <ShieldAlert className="w-7 h-7 text-blue-600" />
          <span>User Accounts & Security</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Manage system login credentials, role assignments, account activation, and password resets.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username, role, name..."
            className="w-full pl-9 pr-4 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white border border-blue-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-700">
            <thead className="bg-blue-50/60 text-blue-900 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Username</th>
                <th className="px-5 py-4">Linked Profile Name</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-gray-900">{u.username}</td>
                  <td className="px-5 py-4 font-medium text-gray-700">
                    {u.profile?.name || (u.role === 'ADMINISTRATOR' ? 'Administrator' : '—')}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'ADMINISTRATOR'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : u.role === 'LECTURER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                          u.status === 'ACTIVE'
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}
                        title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                      </button>

                      <button
                        onClick={() => setResettingUser(u)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Reset User Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reset Password</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resettingUser}
        onClose={() => setResettingUser(null)}
        title={`Reset Password: ${resettingUser?.username}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setResettingUser(null)}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
