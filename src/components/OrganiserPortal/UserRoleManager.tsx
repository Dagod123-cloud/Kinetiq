import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  GraduationCap,
  Crown,
  RefreshCw,
  UserCheck,
  UserX,
  Filter,
  ArrowUpDown,
  Building,
  Mail,
  Award
} from 'lucide-react';
import { UserAccount, HouseName } from '../../types/index.ts';
import { playSuccessChime, playUiClick } from '../../utils/soundEffects.ts';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'STUDENT' | 'ORGANISER';
  schoolName?: string;
  yearGroup?: number;
  className?: string;
  sectionName?: string;
  house?: HouseName;
  studentIdNumber?: string;
  department?: string;
  title?: string;
  isMasterAdmin?: boolean;
}

const DEFAULT_FALLBACK_USERS: ManagedUser[] = [
  {
    id: 'user-sarang',
    name: 'Sarang',
    email: '1300-sarang-smr@smgeducation.org',
    username: 'sarang',
    role: 'ORGANISER',
    schoolName: "St. Jude's Academy",
    title: 'Lead Administrator & School Owner',
    department: 'School Leadership & SMR TechNova',
    isMasterAdmin: true
  }
];

interface UserRoleManagerProps {
  currentUser: UserAccount;
  onRefreshSession?: () => void;
}

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  currentUser,
  onRefreshSession
}) => {
  const [users, setUsers] = useState<ManagedUser[]>(DEFAULT_FALLBACK_USERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ORGANISER' | 'STUDENT'>('ALL');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Check if current logged-in user is Master Admin (Sarang)
  const isMasterAdmin = useMemo(() => {
    const email = currentUser.email?.toLowerCase().trim() || '';
    const username = (currentUser as any).username?.toLowerCase().trim() || '';
    return email === '1300-sarang-smr@smgeducation.org' || username === 'sarang';
  }, [currentUser]);

  // Fetch all users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('kinetiq_session_token') || 'admin-session-active';
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-session-token': token,
          'x-user-email': currentUser.email
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setFeedback({
          type: 'error',
          message: errData.error || 'Failed to retrieve user directory from server'
        });
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setFeedback({
        type: 'error',
        message: 'Network error connecting to user authority service'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser.email]);

  // Handle changing user role
  const handleUpdateRole = async (targetUser: ManagedUser, newRole: 'STUDENT' | 'ORGANISER') => {
    if (targetUser.role === newRole) return;

    // Guard against modifying Sarang
    if (
      targetUser.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' ||
      targetUser.username?.toLowerCase() === 'sarang' ||
      targetUser.isMasterAdmin
    ) {
      setFeedback({
        type: 'error',
        message: 'Security Violation: The Master Administrator account (Sarang) is permanently locked and protected from role changes.'
      });
      return;
    }

    setUpdatingUserId(targetUser.id);
    playUiClick();

    try {
      const token = localStorage.getItem('kinetiq_session_token') || 'admin-session-active';
      const res = await fetch(`/api/users/${targetUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-session-token': token,
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playSuccessChime();
        setUsers(prev =>
          prev.map(u => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
        setFeedback({
          type: 'success',
          message: `Permissions updated: ${targetUser.name} is now ${newRole === 'ORGANISER' ? 'an Administrator' : 'a Student'}.`
        });

        // Trigger session refresh if the modified user happens to be the active user
        if (targetUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
          onRefreshSession?.();
        }
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to update user role'
        });
      }
    } catch (err: any) {
      console.error('Error updating role:', err);
      setFeedback({
        type: 'error',
        message: 'Network error occurred while applying role permissions'
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q) ||
        user.className?.toLowerCase().includes(q) ||
        user.studentIdNumber?.toLowerCase().includes(q) ||
        user.department?.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Statistics
  const adminCount = users.filter(u => u.role === 'ORGANISER').length;
  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const totalCount = users.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Master Authority Header */}
      <div className="bg-gradient-to-r from-amber-500/20 via-purple-900/30 to-indigo-900/20 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-4 top-4 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Sarang Lead Authority</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                User Roles & Access Control Manager
              </h1>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              As the Master Lead Administrator, you hold full authority to decide who is an{' '}
              <span className="text-purple-300 font-bold">Admin (Organiser)</span> or a{' '}
              <span className="text-cyan-300 font-bold">Student</span>. Only your account is admin by default, and your ownership is permanently protected.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playUiClick();
                fetchUsers();
              }}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
          </div>
        </div>

        {/* Master Account Status Card */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300">
                  Sarang (1300-sarang-smr@smgeducation.org)
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Master Owner
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Permanent Administrator • Protected from demotion or lockout
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isMasterAdmin ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Active Session: You are the Master Administrator
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Operating as: {currentUser.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {feedback.type === 'info' && <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white px-2 py-1 rounded-lg text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Registered Users</div>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Faculty, Staff & Students</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-purple-800/40 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-purple-300">Active Administrators</div>
            <div className="text-2xl font-black text-purple-200 mt-1">{adminCount}</div>
            <div className="text-[11px] text-purple-400/80 mt-0.5">
              {adminCount === 1 ? 'Only Sarang (Master Admin)' : `${adminCount} Admins Assigned`}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Crown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-cyan-800/40 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-cyan-300">Active Students</div>
            <div className="text-2xl font-black text-cyan-200 mt-1">{studentCount}</div>
            <div className="text-[11px] text-cyan-400/80 mt-0.5">Standard student portal access</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, student ID, class, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => {
              playUiClick();
              setRoleFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => {
              playUiClick();
              setRoleFilter('ORGANISER');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'ORGANISER'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Admins ({adminCount})</span>
          </button>
          <button
            onClick={() => {
              playUiClick();
              setRoleFilter('STUDENT');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'STUDENT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Students ({studentCount})</span>
          </button>
        </div>
      </div>

      {/* User Directory Table / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>Directory of Users & System Permissions</span>
            <span className="text-xs font-normal text-slate-400">
              ({filteredUsers.length} shown)
            </span>
          </h2>
          <span className="text-[11px] text-amber-400/80 font-mono">
            Direct 1-Click Role Promotion / Demotion
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-400" />
            <p className="text-xs font-bold">Synchronizing role access control directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No users match your search criteria</p>
            <p className="text-xs text-slate-500">Try modifying your search query or role filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredUsers.map(user => {
              const isUserMaster =
                user.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' ||
                user.username?.toLowerCase() === 'sarang' ||
                user.isMasterAdmin;

              const isUpdating = updatingUserId === user.id;

              return (
                <div
                  key={user.id}
                  className={`p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 ${
                    isUserMaster ? 'bg-amber-500/5 border-l-4 border-l-amber-400' : ''
                  }`}
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                        isUserMaster
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 ring-2 ring-amber-400/50'
                          : user.role === 'ORGANISER'
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white ring-1 ring-purple-400/30'
                          : 'bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white'
                      }`}
                    >
                      {isUserMaster ? (
                        <Crown className="w-5 h-5 text-slate-950" />
                      ) : user.role === 'ORGANISER' ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        user.name
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {user.name}
                        </span>

                        {isUserMaster ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            <Crown className="w-3 h-3 text-amber-400" />
                            Master Administrator (Owner)
                          </span>
                        ) : user.role === 'ORGANISER' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            <ShieldCheck className="w-3 h-3 text-purple-400" />
                            Admin (Organiser)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <GraduationCap className="w-3 h-3 text-cyan-400" />
                            Student
                          </span>
                        )}

                        {user.house && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {user.house} House
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {user.email}
                        </span>
                        {user.studentIdNumber && (
                          <span className="text-slate-500 font-mono">
                            ID: {user.studentIdNumber}
                          </span>
                        )}
                        {user.yearGroup && (
                          <span className="text-slate-400">
                            Yr {user.yearGroup} • {user.className || '10-A'}
                          </span>
                        )}
                        {user.department && (
                          <span className="text-purple-400/90">
                            Dept: {user.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Role Control Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {isUserMaster ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Protected Master Account</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {user.role === 'STUDENT' ? (
                          <button
                            onClick={() => handleUpdateRole(user, 'ORGANISER')}
                            disabled={isUpdating}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            title="Promote this user to School Administrator / Organiser"
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                            )}
                            <span>Promote to Admin</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateRole(user, 'STUDENT')}
                            disabled={isUpdating}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            title="Demote this user to standard Student account"
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>Change to Student</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Guidance Note */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Security Rule Enforcement:</strong> Sarang
          (1300-sarang-smr@smgeducation.org) is the only account seeded with administrative authority.
          Any newly registered accounts start as Students by default. Only you have the power to grant or revoke Admin status at any time. Changes apply in real-time across the school portal.
        </p>
      </div>
    </div>
  );
};
