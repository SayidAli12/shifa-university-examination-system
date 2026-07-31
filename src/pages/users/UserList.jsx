import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import {
  UserCog,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Lock,
  Users,
  UserCheck,
  UserX,
  Crown,
  Key
} from 'lucide-react';
import {
  createFirebaseUser,
  apiCreateUser,
  apiUpdateUser,
  apiToggleUserStatus,
  apiDeleteUser,
  apiResetPassword
} from '../../firebase/auth';
import { setDocumentWithId, updateDocument, deleteDocument } from '../../firebase/firestoreService';

// ── Field validation ──────────────────────────────────────────────────────────
const validateUserForm = ({ name, email, password, role, status }, isNew) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Full name is required.';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!email.trim()) errors.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (isNew) {
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  }
  if (!role) errors.role = 'Please select a role.';
  if (!status) errors.status = 'Please select a status.';
  return errors;
};

const EMPTY_FORM = { name: '', email: '', password: '', role: '', status: 'Active' };
const formatDate = (date) => {
  if (!date) return '';

  try {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString();
    }

    if (date instanceof Date) {
      return date.toLocaleDateString();
    }

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString();
  } catch {
    return '';
  }
};

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${role === 'admin' || role === 'Admin'
    ? 'bg-red-50 text-[#C62828] border-red-200'
    : 'bg-blue-50 text-blue-800 border-blue-200'
    }`}>
    {role === 'admin' || role === 'Admin' ? <Crown className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
    {role}
  </span>
);

// ── Password input with toggle ────────────────────────────────────────────────
const PasswordInput = ({ value, onChange, error, label = 'Password', placeholder = 'Enter password...' }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-9 pr-10 py-2 text-sm border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] ${error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
            }`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
};

// ── Labeled form field wrapper ────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, error }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">
      {Icon && <Icon className="inline w-3.5 h-3.5 mr-1 text-slate-400" />}{label}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`flex items-center gap-3 p-4 rounded-xl border ${color} bg-white shadow-2xs`}>
    <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-200', '-100')}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
export const UserList = () => {
  const { currentUser } = useAuth();
  const { usersList, updateUserStatus } = useData();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Add modal ────────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState({});

  // ── Edit modal ───────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState(null); // full user row
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState({});

  // ── Delete confirmation ───────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: usersList.length,
    admins: usersList.filter(u => u.role?.toLowerCase() === 'admin').length,
    teachers: usersList.filter(u => u.role?.toLowerCase() === 'teacher').length,
    active: usersList.filter(u => u.status === 'Active').length,
    inactive: usersList.filter(u => u.status === 'Inactive').length,
  }), [usersList]);

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => usersList.filter(user => {
    const matchSearch =
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter ? user.role?.toLowerCase() === roleFilter.toLowerCase() : true;
    const matchStatus = statusFilter ? user.status?.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchSearch && matchRole && matchStatus;
  }), [usersList, searchTerm, roleFilter, statusFilter]);

  // ────────────────────────────────────────────────────────────────────────────
  // CREATE USER
  // ────────────────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setAddForm(EMPTY_FORM);
    setAddErrors({});
    setShowAddModal(true);
  };

  const handleAddChange = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
    if (addErrors[field]) setAddErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = validateUserForm(addForm, true);
    if (Object.keys(errs).length) { setAddErrors(errs); return; }

    setIsSaving(true);
    try {
      // Create user via Serverless API (Firebase Admin SDK)
      // Performs atomic Auth + Firestore creation with automatic rollback on failure
      const result = await apiCreateUser({
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        role: addForm.role,
        status: addForm.status
      });

      console.info('[UserList] User created via Serverless API — UID:', result.uid);
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      showToast(`User "${addForm.name.trim()}" created successfully.`);
    } catch (err) {
      console.error('[UserList] Create user error:', err.message);
      showToast(err.message || 'Failed to create user.', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  // ────────────────────────────────────────────────────────────────────────────
  // EDIT USER
  // ────────────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      status: user.status || 'Active',
    });
    setEditErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errs = validateUserForm(editForm, false);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }

    setIsSaving(true);
    try {
      const docId = editTarget.id || editTarget.uid;
      // Update via Serverless API (Firebase Admin SDK) — updates Auth & Firestore
      await apiUpdateUser({
        uid: docId,
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        status: editForm.status
      });
      setEditTarget(null);
      showToast(`User "${editForm.name.trim()}" updated successfully.`);
    } catch (err) {
      console.error('[UserList] Edit user error:', err);
      showToast(err.message || 'Failed to update user.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // TOGGLE STATUS
  // ────────────────────────────────────────────────────────────────────────────
  const handleToggleStatus = async (user) => {
    const isSelf = user.uid === currentUser?.uid || user.email === currentUser?.email;
    if (isSelf) {
      showToast('You cannot deactivate your own account.', 'error');
      return;
    }
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const docId = user.id || user.uid;
      // Synchronize Firebase Auth disabled state and Firestore status via Serverless API
      await apiToggleUserStatus(docId, newStatus);
      showToast(`Account set to ${newStatus}.`, newStatus === 'Active' ? 'success' : 'info');
    } catch (err) {
      console.error('[UserList] Toggle status error:', err);
      showToast(err.message || 'Failed to update account status.', 'error');
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RESET PASSWORD
  // ────────────────────────────────────────────────────────────────────────────
  const handleResetPassword = async (user) => {
    setIsSaving(true);
    try {
      await apiResetPassword({ uid: user.uid || user.id, email: user.email });
      showToast(`Password reset request processed for "${user.name}".`, 'success');
    } catch (err) {
      console.error('[UserList] Reset password error:', err);
      showToast(err.message || 'Failed to process password reset.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE USER
  // ────────────────────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      const docId = deleteTarget.id || deleteTarget.uid;
      // Delete Firebase Auth user & Firestore user document via Serverless API
      await apiDeleteUser(docId);
      setDeleteTarget(null);
      showToast(`User "${deleteTarget.name}" has been deleted.`, 'success');
    } catch (err) {
      console.error('[UserList] Delete user error:', err);
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setIsSaving(false);
    }
  };



  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#C62828]" />
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, manage, and control access for all system users.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAdd}
          id="add-user-btn"
        >
          Add New User
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Users" value={stats.total} icon={Users} color="border-slate-200" />
        <StatCard label="Admins" value={stats.admins} icon={Crown} color="border-red-200" />
        <StatCard label="Teachers" value={stats.teachers} icon={UserIcon} color="border-blue-200" />
        <StatCard label="Active" value={stats.active} icon={UserCheck} color="border-emerald-200" />
        <StatCard label="Inactive" value={stats.inactive} icon={UserX} color="border-amber-200" />
      </div>

      {/* ── Filter Bar ── */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name or email..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="All Roles"
            options={['Admin', 'Teacher']}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
          <Select
            placeholder="All Statuses"
            options={['Active', 'Inactive']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* ── Users Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No users found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => {
                  const isSelf = user.uid === currentUser?.uid || user.email === currentUser?.email;
                  return (
                    <tr
                      key={user.id || user.uid}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{idx + 1}</td>

                      {/* User info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase flex-shrink-0 border border-slate-200">
                            {(user.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {user.name || '—'}
                              {isSelf && (
                                <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">You</span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge status={user.status}>{user.status}</Badge>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {formatDate(user.createdAt) || '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={isSelf}
                            title={user.status === 'Active' ? 'Deactivate user' : 'Activate user'}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${user.status === 'Active'
                              ? 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
                              : 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              }`}
                          >
                            {user.status === 'Active'
                              ? <><XCircle className="w-3.5 h-3.5" />Deactivate</>
                              : <><CheckCircle className="w-3.5 h-3.5" />Activate</>
                            }
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit user"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(user)}
                            title="Reset user password"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(user)}
                            disabled={isSelf}
                            title="Delete user"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {filteredUsers.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{usersList.length}</span> user{usersList.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          ADD USER MODAL
      ════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New User"
        subtitle="Fill in the details below. The user can log in immediately after creation."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4" id="add-user-form">
          {/* Name */}
          <Field label="Full Name" icon={UserIcon} error={addErrors.name}>
            <input
              type="text"
              value={addForm.name}
              onChange={e => handleAddChange('name', e.target.value)}
              placeholder="e.g. Dr. Sarah Ahmed"
              className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-colors ${addErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
                }`}
            />
          </Field>

          {/* Email */}
          <Field label="Email Address" icon={Mail} error={addErrors.email}>
            <input
              type="email"
              value={addForm.email}
              onChange={e => handleAddChange('email', e.target.value)}
              placeholder="e.g. sarah.ahmed@shifa.edu.pk"
              className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-colors ${addErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
                }`}
            />
          </Field>

          {/* Password */}
          <PasswordInput
            label="Password"
            value={addForm.password}
            onChange={e => handleAddChange('password', e.target.value)}
            error={addErrors.password}
            placeholder="Min. 6 characters"
          />

          {/* Role + Status side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" icon={ShieldCheck} error={addErrors.role}>
              <select
                value={addForm.role}
                onChange={e => handleAddChange('role', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] bg-white transition-colors ${addErrors.role ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
              >
                <option value="">Select role...</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
              </select>
            </Field>

            <Field label="Status" error={addErrors.status}>
              <select
                value={addForm.status}
                onChange={e => handleAddChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This will create a real Firebase Authentication account. The user can log in immediately with the assigned email and password.
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus} disabled={isSaving}>
              {isSaving ? 'Creating User...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════
          EDIT USER MODAL
      ════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit User"
        subtitle={`Editing profile for ${editTarget?.name || 'user'}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4" id="edit-user-form">
          {/* Name */}
          <Field label="Full Name" icon={UserIcon} error={editErrors.name}>
            <input
              type="text"
              value={editForm.name}
              onChange={e => handleEditChange('name', e.target.value)}
              placeholder="Full name"
              className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-colors ${editErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
                }`}
            />
          </Field>

          {/* Email (read-only — can't change Auth email here) */}
          <Field label="Email Address (read-only)" icon={Mail}>
            <input
              type="email"
              value={editForm.email}
              readOnly
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed from here. Contact Firebase Console to update it.</p>
          </Field>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" icon={ShieldCheck} error={editErrors.role}>
              <select
                value={editForm.role}
                onChange={e => handleEditChange('role', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] bg-white transition-colors ${editErrors.role ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
              >
                <option value="">Select role...</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
              </select>
            </Field>

            <Field label="Status" error={editErrors.status}>
              <select
                value={editForm.status}
                onChange={e => handleEditChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEditTarget(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Pencil} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════════════
          DELETE CONFIRMATION
      ════════════════════════════════════════════════════ */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This removes their Firestore profile. Their Firebase Authentication account must be removed separately from the Firebase Console.`}
        confirmText="Delete User"
        cancelText="Cancel"
      />
    </div>
  );
};
