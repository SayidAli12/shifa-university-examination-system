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
import { Building2, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const FacultyList = () => {
  const { role } = useAuth();
  const { faculties, departments, addFaculty, updateFaculty, deleteFaculty } = useData();

  // Local state for search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Filtered List
  const filteredFaculties = faculties.filter((faculty) => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (faculty.description && faculty.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? faculty.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setCurrentFaculty(null);
    setFormData({ name: '', description: '', status: 'Active' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faculty) => {
    setCurrentFaculty(faculty);
    setFormData({
      name: faculty.name || '',
      description: faculty.description || '',
      status: faculty.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Faculty name is required.';
    } else {
      // Check duplicate faculty name (excluding current being edited)
      const duplicate = faculties.find(
        f => f.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && f.id !== currentFaculty?.id
      );
      if (duplicate) {
        errors.name = 'A faculty with this name already exists.';
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
      if (currentFaculty) {
        await updateFaculty(currentFaculty.id, formData);
        setToast({ message: 'Faculty updated successfully!', type: 'success' });
      } else {
        await addFaculty(formData);
        setToast({ message: 'Faculty created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (faculty) => {
    const newStatus = faculty.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateFaculty(faculty.id, { status: newStatus });
      setToast({ message: `Faculty set to ${newStatus}.`, type: 'info' });
    } catch (err) {
      setToast({ message: 'Status change failed.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!facultyToDelete) return;
    setSubmitting(true);
    try {
      await deleteFaculty(facultyToDelete.id);
      setToast({ message: 'Faculty deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setFacultyToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Faculty Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.name}</h4>
          {row.description && <p className="text-xs text-slate-500 mt-0.5">{row.description}</p>}
        </div>
      )
    },
    {
      header: 'Departments',
      render: (row) => {
        const deptCount = departments.filter(d => d.facultyId === row.id).length;
        return (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {deptCount} Departments
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
            className="p-1.5 rounded-lg text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setFacultyToDelete(row);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
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
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic management of university faculties and academic divisions.
          </p>
        </div>
        {role === 'admin' && (
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add New Faculty
          </Button>
        )}
      </div>

      {/* Search & Filter Control Card */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search faculty by name..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              placeholder="All Statuses"
              options={['Active', 'Inactive']}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Table
        columns={columns}
        data={filteredFaculties}
        emptyTitle="No Faculties Found"
        emptyDescription="Create your first faculty to begin setting up departments and courses."
        emptyActionLabel={role === 'admin' ? "Add New Faculty" : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        subtitle="Specify faculty title, operational status, and optional overview description."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Faculty Name"
            placeholder="e.g. Faculty of Information Technology"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description / Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828] bg-white"
              rows={3}
              placeholder="Brief description of departments and disciplines covered..."
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
              {submitting ? 'Saving...' : currentFaculty ? 'Save Changes' : 'Create Faculty'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Faculty"
        message={`Are you sure you want to delete "${facultyToDelete?.name}"? All associated departments should be verified before deletion.`}
        confirmText="Delete Faculty"
        isLoading={submitting}
      />
    </div>
  );
};
