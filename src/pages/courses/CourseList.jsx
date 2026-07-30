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
import { BookOpen, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const CourseList = () => {
  const { role } = useAuth();
  const { faculties, departments, courses, addCourse, updateCourse, deleteCourse } = useData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState({
    facultyId: '',
    departmentId: '',
    courseCode: '',
    courseName: '',
    creditHours: 3,
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cascading departments for form
  const [availableFormDepts, setAvailableFormDepts] = useState([]);

  // Confirm Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Update cascading form departments when selected facultyId changes
  useEffect(() => {
    if (formData.facultyId) {
      const depts = departments.filter(d => d.facultyId === formData.facultyId);
      setAvailableFormDepts(depts);
      // Reset departmentId if current selected doesn't belong to new faculty
      if (!depts.some(d => d.id === formData.departmentId)) {
        setFormData(prev => ({ ...prev, departmentId: depts.length > 0 ? depts[0].id : '' }));
      }
    } else {
      setAvailableFormDepts([]);
    }
  }, [formData.facultyId, departments]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = facultyFilter ? c.facultyId === facultyFilter : true;
    const matchesDept = deptFilter ? c.departmentId === deptFilter : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesFaculty && matchesDept && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setCurrentCourse(null);
    const initialFacId = faculties.length > 0 ? faculties[0].id : '';
    const initialDepts = departments.filter(d => d.facultyId === initialFacId);
    setFormData({
      facultyId: initialFacId,
      departmentId: initialDepts.length > 0 ? initialDepts[0].id : '',
      courseCode: '',
      courseName: '',
      creditHours: 3,
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setCurrentCourse(course);
    setFormData({
      facultyId: course.facultyId || '',
      departmentId: course.departmentId || '',
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      creditHours: course.creditHours || 3,
      status: course.status || 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.facultyId) errors.facultyId = 'Please select a faculty.';
    if (!formData.departmentId) errors.departmentId = 'Please select a department.';
    if (!formData.courseCode.trim()) {
      errors.courseCode = 'Course code is required.';
    } else {
      const duplicate = courses.find(
        c => c.courseCode.toUpperCase().trim() === formData.courseCode.toUpperCase().trim() && c.id !== currentCourse?.id
      );
      if (duplicate) errors.courseCode = 'A course with this code already exists.';
    }
    if (!formData.courseName.trim()) errors.courseName = 'Course name is required.';
    if (!formData.creditHours || formData.creditHours <= 0) errors.creditHours = 'Valid credit hours required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        courseCode: formData.courseCode.toUpperCase().trim(),
        creditHours: Number(formData.creditHours)
      };

      if (currentCourse) {
        await updateCourse(currentCourse.id, payload);
        setToast({ message: 'Course updated successfully!', type: 'success' });
      } else {
        await addCourse(payload);
        setToast({ message: 'Course created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (course) => {
    const newStatus = course.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateCourse(course.id, { status: newStatus });
      setToast({ message: `Course set to ${newStatus}.`, type: 'info' });
    } catch (err) {
      setToast({ message: 'Status change failed.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    setSubmitting(true);
    try {
      await deleteCourse(courseToDelete.id);
      setToast({ message: 'Course deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setCourseToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: 'courseCode',
      render: (row) => (
        <span className="font-bold text-[#C62828] bg-red-50 px-2.5 py-1 rounded-md text-xs border border-red-100">
          {row.courseCode}
        </span>
      )
    },
    {
      header: 'Course Title',
      accessor: 'courseName',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.courseName}</h4>
          <p className="text-xs text-slate-500">{row.creditHours} Credit Hours</p>
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
                  setCourseToDelete(row);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic course catalog with cascading Faculty & Department associations.
          </p>
        </div>
        {role === 'admin' && (
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add New Course
          </Button>
        )}
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Search by code or title..."
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
        data={filteredCourses}
        emptyTitle="No Courses Found"
        emptyDescription="Create courses to attach to exams and examination schedules."
        emptyActionLabel={role === 'admin' ? "Add New Course" : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCourse ? 'Edit Course' : 'Add New Course'}
        subtitle="Cascading faculty and department assignment."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Course Code"
              placeholder="e.g. CS101"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              error={formErrors.courseCode}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Course Title"
                placeholder="e.g. Intro to Programming"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                error={formErrors.courseName}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Credit Hours"
              type="number"
              min="1"
              max="12"
              value={formData.creditHours}
              onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })}
              error={formErrors.creditHours}
              required
            />
            <Select
              label="Status"
              options={['Active', 'Inactive']}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : currentCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete course "${courseToDelete?.courseCode} - ${courseToDelete?.courseName}"?`}
        confirmText="Delete Course"
        isLoading={submitting}
      />
    </div>
  );
};
