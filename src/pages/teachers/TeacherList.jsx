import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Badge } from '../../components/common/Badge';
import { Toast } from '../../components/common/Toast';
import { Users, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const TeacherList = () => {
  const { role } = useAuth();
  const { faculties, departments, teachers, addTeacher, updateTeacher, deleteTeacher } = useData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    facultyId: '',
    departmentId: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [availableFormDepts, setAvailableFormDepts] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (formData.facultyId) {
      const depts = departments.filter(d => d.facultyId === formData.facultyId);
      setAvailableFormDepts(depts);
      if (!depts.some(d => d.id === formData.departmentId)) {
        setFormData(prev => ({ ...prev, departmentId: depts.length > 0 ? depts[0].id : '' }));
      }
    } else {
      setAvailableFormDepts([]);
    }
  }, [formData.facultyId, departments]);

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = facultyFilter ? t.facultyId === facultyFilter : true;
    const matchesDept = deptFilter ? t.departmentId === deptFilter : true;
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesFaculty && matchesDept && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setCurrentTeacher(null);
    const initialFacId = faculties.length > 0 ? faculties[0].id : '';
    const initialDepts = departments.filter(d => d.facultyId === initialFacId);
    setFormData({
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      phone: '',
      facultyId: initialFacId,
      departmentId: initialDepts.length > 0 ? initialDepts[0].id : '',
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setCurrentTeacher(t);
    setFormData({
      employeeId: t.employeeId || '',
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      facultyId: t.facultyId || '',
      departmentId: t.departmentId || '',
      status: t.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email address is required.';
    }
    if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required.';
    if (!formData.facultyId) errors.facultyId = 'Faculty selection required.';
    if (!formData.departmentId) errors.departmentId = 'Department selection required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (currentTeacher) {
        await updateTeacher(currentTeacher.id, formData);
        setToast({ message: 'Teacher record updated!', type: 'success' });
      } else {
        await addTeacher(formData);
        setToast({ message: 'Teacher account created!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (teacher) => {
    const newStatus = teacher.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateTeacher(teacher.id, { status: newStatus });
      setToast({ message: `Teacher set to ${newStatus}.`, type: 'info' });
    } catch (err) {
      setToast({ message: 'Status update failed.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    setSubmitting(true);
    try {
      await deleteTeacher(teacherToDelete.id);
      setToast({ message: 'Teacher deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTeacherToDelete(null);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'employeeId',
      render: (row) => (
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.employeeId}
        </span>
      )
    },
    {
      header: 'Teacher Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.name}</h4>
          <p className="text-xs text-slate-500">{row.email} • {row.phone || 'No Phone'}</p>
        </div>
      )
    },
    {
      header: 'Faculty & Department',
      render: (row) => {
        const fac = faculties.find(f => f.id === row.facultyId);
        const dept = departments.find(d => d.id === row.departmentId);
        return (
          <div className="text-xs">
            <p className="font-semibold text-slate-800">{dept?.name || 'N/A'}</p>
            <p className="text-slate-500">{fac?.name || 'N/A'}</p>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              row.status === 'Active' 
                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          {role === 'admin' && (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="p-1.5 rounded-lg text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setTeacherToDelete(row);
                  setDeleteModalOpen(true);
                }}
                className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teacher Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic faculty members directory with institutional assignments.
          </p>
        </div>
        {role === 'admin' && (
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add New Teacher
          </Button>
        )}
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Search by name, email, ID..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="All Faculties"
            options={faculties}
            valueKey="id"
            labelKey="name"
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
          />
          <Select
            placeholder="All Departments"
            options={departments.filter(d => !facultyFilter || d.facultyId === facultyFilter)}
            valueKey="id"
            labelKey="name"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          />
          <Select
            placeholder="All Statuses"
            options={['Active', 'Inactive']}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        data={filteredTeachers}
        emptyTitle="No Teachers Found"
        emptyDescription="Add teacher profiles to assign course instructions and examination duties."
        emptyActionLabel={role === 'admin' ? "Add New Teacher" : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTeacher ? 'Edit Teacher Profile' : 'Add New Teacher'}
        subtitle="Specify employee credentials and department affiliation."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              placeholder="e.g. EMP-1001"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              error={formErrors.employeeId}
              required
            />
            <Input
              label="Full Name"
              placeholder="e.g. Prof. Alan Turing"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="University Email"
              type="email"
              placeholder="turing@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Faculty"
              options={faculties}
              valueKey="id"
              labelKey="name"
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              error={formErrors.facultyId}
              required
            />
            <Select
              label="Department"
              options={availableFormDepts}
              valueKey="id"
              labelKey="name"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              error={formErrors.departmentId}
              required
            />
          </div>

          <Select
            label="Status"
            options={['Active', 'Inactive']}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          />

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : currentTeacher ? 'Save Changes' : 'Create Teacher'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher Record"
        message={`Are you sure you want to delete profile for "${teacherToDelete?.name}"?`}
        confirmText="Delete Teacher"
        isLoading={submitting}
      />
    </div>
  );
};
