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
import { SCHEDULE_STATUSES } from '../../utils/constants';
import { Calendar, Plus, Search, Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

export const ScheduleList = () => {
  const { currentUser, role } = useAuth();
  const { exams, courses, teachers, examSchedules, addSchedule, updateSchedule, deleteSchedule } = useData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({
    examId: '',
    courseId: '',
    teacherId: '',
    room: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    status: 'Scheduled'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Confirm Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [schedToDelete, setSchedToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const currentTeacherRecord = teachers.find(
    t => t.email.toLowerCase() === currentUser?.email?.toLowerCase() || t.userId === currentUser?.uid
  );

  // Synchronize courseId and teacherId automatically when examId changes in form
  useEffect(() => {
    if (formData.examId) {
      const selectedExam = exams.find(e => e.id === formData.examId);
      if (selectedExam) {
        setFormData(prev => ({
          ...prev,
          courseId: selectedExam.courseId,
          teacherId: selectedExam.teacherId,
          date: selectedExam.date || prev.date
        }));
      }
    }
  }, [formData.examId, exams]);

  const filteredSchedules = examSchedules.filter((sched) => {
    // Role filter
    if (role === 'teacher' && currentTeacherRecord) {
      if (sched.teacherId !== currentTeacherRecord.id && sched.teacherId !== currentUser?.uid) {
        return false;
      }
    }

    const exam = exams.find(e => e.id === sched.examId);
    const matchesSearch = (exam?.title && exam.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (sched.room && sched.room.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTeacher = teacherFilter ? sched.teacherId === teacherFilter : true;
    const matchesStatus = statusFilter ? sched.status === statusFilter : true;
    const matchesDate = dateFilter ? sched.date === dateFilter : true;

    return matchesSearch && matchesTeacher && matchesStatus && matchesDate;
  });

  const handleOpenAddModal = () => {
    setCurrentSchedule(null);
    const firstExam = exams.length > 0 ? exams[0] : null;
    setFormData({
      examId: firstExam ? firstExam.id : '',
      courseId: firstExam ? firstExam.courseId : '',
      teacherId: firstExam ? firstExam.teacherId : '',
      room: 'Hall A - Building 3',
      date: firstExam ? firstExam.date : new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      status: 'Scheduled'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sched) => {
    setCurrentSchedule(sched);
    setFormData({
      examId: sched.examId || '',
      courseId: sched.courseId || '',
      teacherId: sched.teacherId || '',
      room: sched.room || '',
      date: sched.date || new Date().toISOString().split('T')[0],
      startTime: sched.startTime || '09:00',
      endTime: sched.endTime || '11:00',
      status: sched.status || 'Scheduled'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.examId) errors.examId = 'Exam selection required.';
    if (!formData.room.trim()) errors.room = 'Room / Examination hall location required.';
    if (!formData.date) errors.date = 'Schedule date required.';
    if (!formData.startTime) errors.startTime = 'Start time required.';
    if (!formData.endTime) errors.endTime = 'End time required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (currentSchedule) {
        await updateSchedule(currentSchedule.id, formData);
        setToast({ message: 'Exam schedule updated!', type: 'success' });
      } else {
        await addSchedule(formData);
        setToast({ message: 'Exam schedule created!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!schedToDelete) return;
    setSubmitting(true);
    try {
      await deleteSchedule(schedToDelete.id);
      setToast({ message: 'Schedule entry deleted.', type: 'success' });
      setDeleteModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'Delete operation failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setSchedToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Examination',
      render: (row) => {
        const exam = exams.find(e => e.id === row.examId);
        const course = courses.find(c => c.id === row.courseId);
        return (
          <div>
            <h4 className="font-bold text-slate-900">{exam?.title || 'Examination'}</h4>
            <p className="text-xs text-[#C62828] font-semibold mt-0.5">
              {course?.courseCode} - {course?.courseName}
            </p>
          </div>
        );
      }
    },
    {
      header: 'Location & Room',
      accessor: 'room',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
          <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
          {row.room}
        </div>
      )
    },
    {
      header: 'Date & Time',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">{formatDate(row.date)}</p>
          <div className="flex items-center gap-1 text-slate-500 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatTime(row.startTime)} - {formatTime(row.endTime)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Supervising Teacher',
      render: (row) => {
        const teacher = teachers.find(t => t.id === row.teacherId);
        return <span className="text-xs font-medium text-slate-700">{teacher?.name || 'Unassigned'}</span>;
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
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {role === 'admin' && (
            <button
              onClick={() => {
                setSchedToDelete(row);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Exam Timetable & Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated timetable management for room allocations, invigilation, and dates.
          </p>
        </div>
        {role === 'admin' && (
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Create Schedule Entry
          </Button>
        )}
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            placeholder="Search exam or room..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Select
            placeholder="All Statuses"
            options={SCHEDULE_STATUSES}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        data={filteredSchedules}
        emptyTitle="No Schedule Entries"
        emptyDescription="Schedule dates and room allocations for registered examinations."
        emptyActionLabel={role === 'admin' ? "Create Schedule Entry" : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSchedule ? 'Edit Schedule Entry' : 'Create Exam Schedule'}
        subtitle="Allocate examination room, date, start time, and invigilator."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Registered Exam"
            options={exams}
            valueKey="id"
            labelKey="title"
            value={formData.examId}
            onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
            error={formErrors.examId}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room / Hall Location"
              placeholder="e.g. Hall A - Building 3"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              error={formErrors.room}
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              error={formErrors.startTime}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              error={formErrors.endTime}
              required
            />
          </div>

          <Select
            label="Schedule Status"
            options={SCHEDULE_STATUSES}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          />

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : currentSchedule ? 'Save Changes' : 'Publish Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule Entry"
        message="Are you sure you want to remove this schedule entry?"
        confirmText="Delete Schedule"
        isLoading={submitting}
      />
    </div>
  );
};
