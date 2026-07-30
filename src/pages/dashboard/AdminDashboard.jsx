import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Logo } from '../../components/common/Logo';
import {
  Building2,
  Layers,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileEdit,
  BarChart3
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { faculties, departments, courses, teachers, exams, examSchedules, results } = useData();

  // Dynamic statistics calculations
  const totalFaculties = faculties.length;
  const totalDepartments = departments.length;
  const totalCourses = courses.length;
  const totalTeachers = teachers.length;
  const totalExams = exams.length;
  const totalResults = results.length;

  const scheduledExams = exams.filter(e => e.status === 'Scheduled').length;
  const completedExams = exams.filter(e => e.status === 'Completed').length;
  const draftExams = exams.filter(e => e.status === 'Draft').length;

  const recentExams = exams.slice(0, 5);
  const upcomingSchedules = examSchedules.slice(0, 5);

  const statsCards = [
    { label: 'Total Faculties', value: totalFaculties, icon: Building2, color: 'text-blue-600 bg-blue-50', link: '/faculties' },
    { label: 'Total Departments', value: totalDepartments, icon: Layers, color: 'text-purple-600 bg-purple-50', link: '/departments' },
    { label: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50', link: '/courses' },
    { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'text-[#C62828] bg-red-50', link: '/teachers' },
  ];

  const examStatsCards = [
    { label: 'Total Exams', value: totalExams, icon: FileText, sub: 'Registered' },
    { label: 'Scheduled Exams', value: scheduledExams, icon: Clock, sub: 'Active upcoming' },
    { label: 'Completed Exams', value: completedExams, icon: CheckCircle2, sub: 'Conducted' },
    { label: 'Recorded Results', value: totalResults, icon: Award, sub: 'Published outcomes' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner featuring Official Logo */}
      <div className="bg-gradient-to-r from-[#8E0000] to-[#C62828] text-white p-6 md:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-xs">
            <Logo size="lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shifa University Administration </h1>
            <p className="text-xs text-red-100 mt-1 max-w-xl">
              Central management console for faculties, departments, course catalogs, academic staff, examination records, timetables, and reports.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/reports')}
            icon={BarChart3}
          >
            View Reports
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-[#C62828] border-white font-semibold hover:bg-slate-100 shadow-2xs"
            onClick={() => navigate('/exams')}
            icon={Plus}
          >
            Create Exam
          </Button>
        </div>
      </div>

      {/* Main Structural Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(stat.link)}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#C62828] transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Examination & Results Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {examStatsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[#C62828]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{stat.value}</h4>
                  <p className="text-xs font-semibold text-slate-700">{stat.label}</p>
                  <p className="text-[10px] text-slate-400">{stat.sub}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <Card title="Management Shortcuts & Actions" subtitle="Frequently accessed administrative operations">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/faculties')} icon={Building2}>
            Add Faculty
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/departments')} icon={Layers}>
            Add Department
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/courses')} icon={BookOpen}>
            Add Course
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/teachers')} icon={Users}>
            Add Teacher
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/exams')} icon={FileText}>
            Create Exam
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/schedules')} icon={Calendar}>
            Schedule Room
          </Button>
        </div>
      </Card>

      {/* Tables & Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Exams */}
        <Card
          title="Recent Examination Records"
          subtitle="Latest exams registered across faculties"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/exams')} icon={ArrowRight}>
              View All
            </Button>
          }
        >
          {recentExams.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No exams recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentExams.map((exam) => {
                const course = courses.find(c => c.id === exam.courseId);
                const teacher = teachers.find(t => t.id === exam.teacherId);
                return (
                  <div key={exam.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{exam.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {course?.courseName || 'Course'} • {teacher?.name || 'Teacher'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge status={exam.status}>{exam.status}</Badge>
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(exam.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming Schedule */}
        <Card
          title="Upcoming Exam Schedules"
          subtitle="Scheduled examination room allocations"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/schedules')} icon={ArrowRight}>
              View Timetable
            </Button>
          }
        >
          {upcomingSchedules.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No exam schedules set.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingSchedules.map((sched) => {
                const exam = exams.find(e => e.id === sched.examId);
                return (
                  <div key={sched.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{exam?.title || 'Examination'}</h4>
                      <p className="text-[11px] text-slate-500">
                        Room: <span className="font-semibold text-slate-700">{sched.room}</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">{formatDate(sched.date)}</p>
                      <p className="text-[10px] text-slate-400">{formatTime(sched.startTime)} - {formatTime(sched.endTime)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
