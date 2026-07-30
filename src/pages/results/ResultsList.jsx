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
import { Award, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const ResultsList = () => {
  const { currentUser, role } = useAuth();
  const { exams, courses, teachers, results, addResult, updateResult, deleteResult } = useData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [formData, setFormData] = useState({
    examId: '',
    courseId: '',
    teacherId: '',
    totalMarks: 100,
    obtainedMarks: 85,
    grade: 'A',
    status: 'Recorded',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Confirm Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const currentTeacherRecord = teachers.find(
    t => t.email.toLowerCase() === currentUser?.email?.toLowerCase() || t.userId === currentUser?.uid
  );

  const filteredResults = results.filter((res) => {
    // Role filter
    if (role === 'teacher' && currentTeacherRecord) {
      if (res.teacherId !== currentTeacherRecord.id && res.teacherId !== currentUser?.uid) {
        return false;
      }
    }

    const exam = exams.find(e => e.id === res.examId);
    const matchesSearch = (exam?.title && exam.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (res.notes && res.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = courseFilter ? res.courseId === courseFilter : true;
    const matchesStatus = statusFilter ? res.status === statusFilter : true;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setCurrentResult(null);
    const firstExam = exams.length > 0 ? exams[0] : null;
    setFormData({
      examId: firstExam ? firstExam.id : '',
      courseId: firstExam ? firstExam.courseId : '',
      teacherId: firstExam ? firstExam.teacherId : '',
      totalMarks: firstExam ? firstExam.totalMarks : 100,
      obtainedMarks: 85,
      grade: 'A',
      status: 'Recorded',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res) => {
    setCurrentResult(res);
    setFormData({
      examId: res.examId || '',
      courseId: res.courseId || '',
      teacherId: res.teacherId || '',
      totalMarks: res.totalMarks || 100,
      obtainedMarks: res.obtainedMarks || 0,
      grade: res.grade || 'A',
      status: res.status || 'Recorded',
      date: res.date || new Date().toISOString().split('T')[0],
      notes: res.notes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.examId) errors.examId = 'Exam selection required.';
    if (formData.obtainedMarks === '' || formData.obtainedMarks < 0) {
      errors.obtainedMarks = 'Valid recorded marks required.';
    }
    if (!formData.grade.trim()) errors.grade = 'Grade / Assessment grade required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const selectedExam = exams.find(e => e.id === formData.examId);
      const payload = {
        ...formData,
        courseId: selectedExam ? selectedExam.courseId : formData.courseId,
        teacherId: selectedExam ? selectedExam.teacherId : formData.teacherId,
        totalMarks: Number(formData.totalMarks),
        obtainedMarks: Number(formData.obtainedMarks)
      };

      if (currentResult) {
        await updateResult(currentResult.id, payload);
        setToast({ message: 'Examination result updated!', type: 'success' });
      } else {
        await addResult(payload);
        setToast({ message: 'Examination result record saved!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!resultToDelete) return;
    setSubmitting(true);
    try {
      await deleteResult(resultToDelete.id);
      setToast({ message: 'Result record deleted.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setResultToDelete(null);
    }
  };

  const RESULT_STATUSES = ['Pending', 'Recorded', 'Approved', 'Published'];

  const columns = [
    {
      header: 'Exam Title',
      render: (row) => {
        const exam = exams.find(e => e.id === row.examId);
        const course = courses.find(c => c.id === row.courseId);
        return (
          <div>
            <h4 className="font-bold text-slate-900">{exam?.title || 'Examination'}</h4>
            <p className="text-xs text-[#C62828] font-semibold mt-0.5">{course?.courseName}</p>
          </div>
        );
      }
    },
    {
      header: 'Assessment & Marks',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">
            Recorded Score: <span className="text-[#C62828]">{row.obtainedMarks}</span> / {row.totalMarks}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Class Grade / Outcome: <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{row.grade}</span>
          </p>
        </div>
      )
    },
    {
      header: 'Assigned Teacher',
      render: (row) => {
        const teacher = teachers.find(t => t.id === row.teacherId);
        return <span className="text-xs font-medium text-slate-700">{teacher?.name || 'Unassigned'}</span>;
      }
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => <span className="text-xs text-slate-600 font-semibold">{formatDate(row.date)}</span>
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
                setResultToDelete(row);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Examination Results & Assessments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional examination performance and assessment records managed by faculty staff.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Record Examination Result
        </Button>
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search result or exam title..."
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
          <Select
            placeholder="All Statuses"
            options={RESULT_STATUSES}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        data={filteredResults}
        emptyTitle="No Result Records Found"
        emptyDescription="Record examination performance and grade distributions for completed exams."
        emptyActionLabel="Record Examination Result"
        onEmptyAction={handleOpenAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentResult ? 'Edit Result Record' : 'Record Examination Result'}
        subtitle="Specify examination marks, assessment outcome, and approval status."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Examination"
            options={exams}
            valueKey="id"
            labelKey="title"
            value={formData.examId}
            onChange={(e) => {
              const selected = exams.find(ex => ex.id === e.target.value);
              setFormData({
                ...formData,
                examId: e.target.value,
                totalMarks: selected ? selected.totalMarks : formData.totalMarks
              });
            }}
            error={formErrors.examId}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Total Marks"
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
              required
            />
            <Input
              label="Recorded Score"
              type="number"
              value={formData.obtainedMarks}
              onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
              error={formErrors.obtainedMarks}
              required
            />
            <Input
              label="Overall Grade / Assessment"
              placeholder="e.g. A, B+, Pass"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              error={formErrors.grade}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Approval Status"
              options={RESULT_STATUSES}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            />
            <Input
              label="Recording Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Assessment Summary & Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C62828] bg-white"
              rows={3}
              placeholder="Summary notes on exam performance..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : currentResult ? 'Save Changes' : 'Publish Result Record'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Result Record"
        message="Are you sure you want to delete this result assessment record?"
        confirmText="Delete Result"
        isLoading={submitting}
      />
    </div>
  );
};
