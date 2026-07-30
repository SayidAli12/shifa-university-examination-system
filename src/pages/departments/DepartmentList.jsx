import React, { useState } from 'react';
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
import { Layers, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DepartmentList = () => {
  const { role } = useAuth();
  const { faculties, departments, courses, addDepartment, updateDepartment, deleteDepartment } = useData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [formData, setFormData] = useState({ facultyId: '', name: '', description: '', status: 'Active' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Confirm Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFaculty = facultyFilter ? dept.facultyId === facultyFilter : true;
    const matchesStatus = statusFilter ? dept.status === statusFilter : true;
    return matchesSearch && matchesFaculty && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setCurrentDepartment(null);
    setFormData({
      facultyId: faculties.length > 0 ? faculties[0].id : '',
      name: '',
      description: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setCurrentDepartment(dept);
    setFormData({
      facultyId: dept.facultyId || '',
      name: dept.name || '',
      description: dept.description || '',
      status: dept.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.facultyId) {
      errors.facultyId = 'Please select a parent faculty.';
    }
    if (!formData.name.trim()) {
      errors.name = 'Department name is required.';
    } else {
      const duplicate = departments.find(
        d => d.facultyId === formData.facultyId &&
             d.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
             d.id !== currentDepartment?.id
      );
      if (duplicate) {
        errors.name = 'A department with this name already exists within the selected faculty.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (currentDepartment) {
        await updateDepartment(currentDepartment.id, formData);
        setToast({ message: 'Department updated successfully!', type: 'success' });
      } else {
        await addDepartment(formData);
        setToast({ message: 'Department created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateDepartment(dept.id, { status: newStatus });
      setToast({ message: `Department set to ${newStatus}.`, type: 'info' });
    } catch (err) {
      setToast({ message: 'Status toggle failed.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    setSubmitting(true);
    try {
      await deleteDepartment(deptToDelete.id);
      setToast({ message: 'Department deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setDeptToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Department Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.name}</h4>
          {row.description && <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>}
        </div>
      )
    },
    {
      header: 'Parent Faculty',
      render: (row) => {
        const fac = faculties.find(f => f.id === row.facultyId);
        return (
          <span className="text-xs font-medium text-slate-800 bg-red-50 text-[#C62828] px-2.5 py-1 rounded-md border border-red-100">
            {fac ? fac.name : 'Unassigned'}
          </span>
        );
      }
    },
    {
      header: 'Courses Count',
      render: (row) => {
        const courseCount = courses.filter(c => c.departmentId === row.id).length;
        return <span className="text-xs text-slate-600 font-semibold">{courseCount} Courses</span>;
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
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeptToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Department Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic departments and assign them dynamically to Faculties.
          </p>
        </div>
        {role === 'admin' && (
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add Department
          </Button>
        )}
      </div>

      <Card bodyClassName="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search department..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64 flex gap-3">
            <Select
              placeholder="All Faculties"
              options={faculties}
              valueKey="id"
              labelKey="name"
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
            />
            <Select
              placeholder="All Statuses"
              options={['Active', 'Inactive']}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filteredDepartments}
        emptyTitle="No Departments Found"
        emptyDescription="Create your first department and assign it to a faculty."
        emptyActionLabel={role === 'admin' ? "Add Department" : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentDepartment ? 'Edit Department' : 'Add Department'}
        subtitle="Select parent faculty and specify department name."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Parent Faculty"
            options={faculties}
            valueKey="id"
            labelKey="name"
            value={formData.facultyId}
            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
            error={formErrors.facultyId}
            required
          />

          <Input
            label="Department Name"
            placeholder="e.g. Computer Science"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description / Details
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828] bg-white"
              rows={3}
              placeholder="Department scope and details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {submitting ? 'Saving...' : currentDepartment ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete department "${deptToDelete?.name}"?`}
        confirmText="Delete Department"
        isLoading={submitting}
      />
    </div>
  );
};
