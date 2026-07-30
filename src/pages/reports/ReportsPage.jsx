import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Logo } from '../../components/common/Logo';
import { 
  BarChart3, 
  Printer, 
  Search, 
  RotateCcw, 
  Building2, 
  Layers, 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  Award 
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

export const ReportsPage = () => {
  const { currentUser, role } = useAuth();
  const { faculties, departments, courses, teachers, exams, examSchedules, results } = useData();

  // Active Report Tab
  const [activeTab, setActiveTab] = useState('faculties');

  // Filter System State
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const clearFilters = () => {
    setSearchTerm('');
    setFacultyFilter('');
    setDeptFilter('');
    setTeacherFilter('');
    setStatusFilter('');
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'faculties', label: 'Faculty Report', icon: Building2 },
    { id: 'departments', label: 'Department Report', icon: Layers },
    { id: 'courses', label: 'Course Report', icon: BookOpen },
    { id: 'teachers', label: 'Teacher Report', icon: Users },
    { id: 'exams', label: 'Examination Report', icon: FileText },
    { id: 'schedules', label: 'Schedule Report', icon: Calendar },
    { id: 'results', label: 'Result Report', icon: Award }
  ];

  // TAB 1: FACULTY REPORT DATA
  const filteredFacultiesData = faculties.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter ? f.status === statusFilter : true)
  );

  // TAB 2: DEPARTMENT REPORT DATA
  const filteredDeptsData = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (facultyFilter ? d.facultyId === facultyFilter : true) &&
    (statusFilter ? d.status === statusFilter : true)
  );

  // TAB 3: COURSE REPORT DATA
  const filteredCoursesData = courses.filter(c => 
    (c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (facultyFilter ? c.facultyId === facultyFilter : true) &&
    (deptFilter ? c.departmentId === deptFilter : true) &&
    (statusFilter ? c.status === statusFilter : true)
  );

  // TAB 4: TEACHER REPORT DATA
  const filteredTeachersData = teachers.filter(t => 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (facultyFilter ? t.facultyId === facultyFilter : true) &&
    (deptFilter ? t.departmentId === deptFilter : true) &&
    (statusFilter ? t.status === statusFilter : true)
  );

  // TAB 5: EXAM REPORT DATA
  const filteredExamsData = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (courseFilter ? e.courseId === courseFilter : true) &&
    (teacherFilter ? e.teacherId === teacherFilter : true) &&
    (statusFilter ? e.status === statusFilter : true)
  );

  // TAB 6: SCHEDULE REPORT DATA
  const filteredSchedulesData = examSchedules.filter(s => 
    (s.room && s.room.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (teacherFilter ? s.teacherId === teacherFilter : true) &&
    (statusFilter ? s.status === statusFilter : true)
  );

  // TAB 7: RESULT REPORT DATA
  const filteredResultsData = results.filter(r => 
    (statusFilter ? r.status === statusFilter : true)
  );

  return (
    <div className="space-y-6">
      {/* Printable Header - Visible ONLY during print */}
      <div className="hidden print:block mb-8 border-b-2 border-red-800 pb-4">
        <div className="flex items-center justify-between">
          <Logo size="print" showText={true} />
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
              Institutional Report: {reportTabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Generated Date: {formatDate(new Date().toISOString())} • By: {currentUser?.name || 'Administrator'} ({role})
            </p>
          </div>
        </div>
      </div>

      {/* Screen Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic university statistics, examination schedules, faculty metrics, and printable summaries.
          </p>
        </div>
        <Button variant="primary" icon={Printer} onClick={handlePrint}>
          Print Report
        </Button>
      </div>

      {/* Tab Selectors (Screen only) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 print:hidden">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#C62828] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Control Box (Screen only) */}
      <Card bodyClassName="p-4" className="print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          <Input
            placeholder="Search keywords..."
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
            placeholder="All Teachers"
            options={teachers}
            valueKey="id"
            labelKey="name"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
          />
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* REPORT CONTENT AREA */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
        {/* FACULTY REPORT */}
        {activeTab === 'faculties' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">University Faculties Overview</h3>
            <Table
              columns={[
                { header: 'Faculty Name', accessor: 'name' },
                { header: 'Description', accessor: 'description' },
                {
                  header: 'Departments',
                  render: (r) => departments.filter(d => d.facultyId === r.id).length
                },
                {
                  header: 'Courses',
                  render: (r) => courses.filter(c => c.facultyId === r.id).length
                },
                {
                  header: 'Teachers',
                  render: (r) => teachers.filter(t => t.facultyId === r.id).length
                },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> }
              ]}
              data={filteredFacultiesData}
            />
          </div>
        )}

        {/* DEPARTMENT REPORT */}
        {activeTab === 'departments' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">Academic Departments Overview</h3>
            <Table
              columns={[
                { header: 'Department Name', accessor: 'name' },
                {
                  header: 'Parent Faculty',
                  render: (r) => faculties.find(f => f.id === r.facultyId)?.name || 'N/A'
                },
                {
                  header: 'Courses Offered',
                  render: (r) => courses.filter(c => c.departmentId === r.id).length
                },
                {
                  header: 'Assigned Teachers',
                  render: (r) => teachers.filter(t => t.departmentId === r.id).length
                },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> }
              ]}
              data={filteredDeptsData}
            />
          </div>
        )}

        {/* COURSE REPORT */}
        {activeTab === 'courses' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">University Course Catalog Report</h3>
            <Table
              columns={[
                { header: 'Code', accessor: 'courseCode' },
                { header: 'Course Name', accessor: 'courseName' },
                {
                  header: 'Faculty & Department',
                  render: (r) => {
                    const fac = faculties.find(f => f.id === r.facultyId);
                    const dept = departments.find(d => d.id === r.departmentId);
                    return `${dept?.name || 'N/A'} (${fac?.name || 'N/A'})`;
                  }
                },
                { header: 'Credits', accessor: 'creditHours' },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> }
              ]}
              data={filteredCoursesData}
            />
          </div>
        )}

        {/* TEACHER REPORT */}
        {activeTab === 'teachers' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">Academic Staff Directory Report</h3>
            <Table
              columns={[
                { header: 'Employee ID', accessor: 'employeeId' },
                { header: 'Teacher Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                {
                  header: 'Department',
                  render: (r) => departments.find(d => d.id === r.departmentId)?.name || 'N/A'
                },
                {
                  header: 'Exams Supervised',
                  render: (r) => exams.filter(e => e.teacherId === r.id).length
                },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> }
              ]}
              data={filteredTeachersData}
            />
          </div>
        )}

        {/* EXAM REPORT */}
        {activeTab === 'exams' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">Examination Administrative Summary</h3>
            <Table
              columns={[
                { header: 'Exam Title', accessor: 'title' },
                {
                  header: 'Course',
                  render: (r) => courses.find(c => c.id === r.courseId)?.courseName || 'N/A'
                },
                {
                  header: 'Teacher',
                  render: (r) => teachers.find(t => t.id === r.teacherId)?.name || 'N/A'
                },
                { header: 'Exam Type', accessor: 'examType' },
                { header: 'Total Marks', accessor: 'totalMarks' },
                { header: 'Date', render: (r) => formatDate(r.date) },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> }
              ]}
              data={filteredExamsData}
            />
          </div>
        )}

        {/* SCHEDULE REPORT */}
        {activeTab === 'schedules' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">Exam Room & Timetable Schedule Report</h3>
            <Table
              columns={[
                {
                  header: 'Exam Title',
                  render: (r) => exams.find(e => e.id === r.examId)?.title || 'N/A'
                },
                { header: 'Room / Hall', accessor: 'room' },
                { header: 'Date', render: (r) => formatDate(r.date) },
                {
                  header: 'Timing',
                  render: (r) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`
                },
                {
                  header: 'Invigilator / Teacher',
                  render: (r) => teachers.find(t => t.id === r.teacherId)?.name || 'N/A'
                },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> }
              ]}
              data={filteredSchedulesData}
            />
          </div>
        )}

        {/* RESULT REPORT */}
        {activeTab === 'results' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 print:text-base">Examination Outcome & Assessment Report</h3>
            <Table
              columns={[
                {
                  header: 'Exam Title',
                  render: (r) => exams.find(e => e.id === r.examId)?.title || 'N/A'
                },
                {
                  header: 'Course',
                  render: (r) => courses.find(c => c.id === r.courseId)?.courseName || 'N/A'
                },
                { header: 'Recorded Score', render: (r) => `${r.obtainedMarks} / ${r.totalMarks}` },
                { header: 'Grade Outcome', accessor: 'grade' },
                { header: 'Status', render: (r) => <Badge status={r.status}>{r.status}</Badge> },
                { header: 'Recording Date', render: (r) => formatDate(r.date) }
              ]}
              data={filteredResultsData}
            />
          </div>
        )}
      </div>

      {/* Print Footer Notice */}
      <div className="hidden print:block mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
        <p>This official report was generated automatically by the Shifa University Examination Management System.</p>
      </div>
    </div>
  );
};
