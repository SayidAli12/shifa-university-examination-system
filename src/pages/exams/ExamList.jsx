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
import { EXAM_TYPES, EXAM_STATUSES } from '../../utils/constants';
import { FileText, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const ExamList = () => {
  const { currentUser, role } = useAuth();
  const { courses, teachers, exams, addExam, updateExam, deleteExam } = useData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    teacherId: '',
    examType: 'Midterm',
    totalMarks: 100,
    date: new Date().toISOString().split('T')[0],
    duration: '120 min',
    status: 'Draft',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Confirm Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Filter exams (If Teacher, show exams assigned to teacher unless Admin)
  const currentTeacherRecord = teachers.find(
    t => t.email.toLowerCase() === currentUser?.email?.toLowerCase() || t.userId === currentUser?.uid
  );

  const filteredExams = exams.filter((exam) => {
    // Role scope
    if (role === 'teacher' && currentTeacherRecord) {
      if (exam.teacherId !== currentTeacherRecord.id && exam.teacherId !== currentUser?.uid) {
        return false;
      }
    }

    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = courseFilter ? exam.courseId === courseFilter : true;
    const matchesTeacher = teacherFilter ? exam.teacherId === teacherFilter : true;
    const matchesStatus = statusFilter ? exam.status === statusFilter : true;
    const matchesType = typeFilter ? exam.examType === typeFilter : true;

    return matchesSearch && matchesCourse && matchesTeacher && matchesStatus && matchesType;
  });

  const handleOpenAddModal = () => {
    setCurrentExam(null);
    setFormData({
      title: '',
      courseId: courses.length > 0 ? courses[0].id : '',
      teacherId: currentTeacherRecord ? currentTeacherRecord.id : (teachers.length > 0 ? teachers[0].id : ''),
      examType: 'Midterm',
      totalMarks: 100,
      date: new Date().toISOString().split('T')[0],
      duration: '120 min',
      status: 'Draft',
      description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam) => {
    setCurrentExam(exam);
    setFormData({
      title: exam.title || '',
      courseId: exam.courseId || '',
      teacherId: exam.teacherId || '',
      examType: exam.examType || 'Midterm',
      totalMarks: exam.totalMarks || 100,
      date: exam.date || new Date().toISOString().split('T')[0],
      duration: exam.duration || '120 min',
      status: exam.status || 'Draft',
      description: exam.description || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Exam title is required.';
    if (!formData.courseId) errors.courseId = 'Associated course selection required.';
    if (!formData.teacherId) errors.teacherId = 'Supervising teacher selection required.';
    if (!formData.totalMarks || formData.totalMarks <= 0) errors.totalMarks = 'Valid total marks required.';
    if (!formData.date) errors.date = 'Examination date is required.';

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
        totalMarks: Number(formData.totalMarks)
      };

      if (currentExam) {
        await updateExam(currentExam.id, payload);
        setToast({ message: 'Exam record updated successfully!', type: 'success' });
      } else {
        await addExam(payload);
        setToast({ message: 'Exam created successfully!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;
    setSubmitting(true);
    try {
      await deleteExam(examToDelete.id);
      setToast({ message: 'Exam record deleted.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setExamToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Exam Title & Details',
      accessor: 'title',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Type: <span className="font-semibold text-slate-700">{row.examType}</span> • Marks: {row.totalMarks} • Duration: {row.duration}
          </p>
        </div>
      )
    },
    {
      header: 'Course',
      render: (row) => {
        const course = courses.find(c => c.id === row.courseId);
        return (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
              {course?.courseCode || 'N/A'}
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-1">{course?.courseName || 'Unassigned Course'}</p>
          </div>
        );
      }
    },
    {
      header: 'Supervising Teacher',
      render: (row) => {
        const teacher = teachers.find(t => t.id === row.teacherId);
        return <span className="text-xs font-medium text-slate-800">{teacher?.name || 'Unassigned'}</span>;
      }
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{formatDate(row.date)}</span>
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
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {role === 'admin' && (
            <button
              onClick={() => {
                setExamToDelete(row);
                setDeleteModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Examination Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administrative record-keeping and lifecycle management of university exams.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Add New Exam
        </Button>
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <Input
            placeholder="Search exam title..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="All Courses"
            options={courses}
            valueKey="id"
            labelKey="courseName"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          />
          {role === 'admin' && (
            <Select
              placeholder="All Teachers"
              options={teachers}
              valueKey="id"
              labelKey="name"
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
            />
          )}
          <Select
            placeholder="Exam Type"
            options={EXAM_TYPES}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Select
            placeholder="Status"
            options={EXAM_STATUSES}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        data={filteredExams}
        emptyTitle="No Examinations Registered"
        emptyDescription="Create exam records to schedule timeslots and hall allocations."
        emptyActionLabel="Add New Exam"
        onEmptyAction={handleOpenAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentExam ? 'Edit Examination Record' : 'Register New Exam'}
        subtitle="Provide examination parameters, date, and administrative status."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Exam Title"
            placeholder="e.g. CS101 Midterm Examination 2026"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Course"
              options={courses}
              valueKey="id"
              labelKey="courseName"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              error={formErrors.courseId}
              required
            />
            <Select
              label="Supervising Teacher"
              options={teachers}
              valueKey="id"
              labelKey="name"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              error={formErrors.teacherId}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Exam Type"
              options={EXAM_TYPES}
              value={formData.examType}
              onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
              required
            />
            <Input
              label="Total Marks"
              type="number"
              min="1"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
              error={formErrors.totalMarks}
              required
            />
            <Input
              label="Duration"
              placeholder="e.g. 120 min"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Exam Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
              required
            />
            <Select
              label="Status"
              options={EXAM_STATUSES}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Administrative Description / Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828] bg-white"
              rows={3}
              placeholder="Instructions or exam administrative notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : currentExam ? 'Save Changes' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Examination Record"
        message={`Are you sure you want to delete exam "${examToDelete?.title}"?`}
        confirmText="Delete Record"
        isLoading={submitting}
      />
    </div>
  );
};
