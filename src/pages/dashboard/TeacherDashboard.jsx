import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Logo } from '../../components/common/Logo';
import { BookOpen, FileText, Calendar, Award, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, exams, examSchedules, results, teachers } = useData();

  const currentTeacher = teachers.find(
    t => t.email?.toLowerCase() === currentUser?.email?.toLowerCase() || t.userId === currentUser?.uid
  ) || teachers[0];

  const myExams = exams.filter(e => e.teacherId === currentTeacher?.id || e.teacherId === currentUser?.uid);
  const mySchedules = examSchedules.filter(s => s.teacherId === currentTeacher?.id || s.teacherId === currentUser?.uid);
  const myResults = results.filter(r => r.teacherId === currentTeacher?.id || r.teacherId === currentUser?.uid);

  const myCourseIds = [...new Set(myExams.map(e => e.courseId))];
  const myCourses = courses.filter(
    c => myCourseIds.includes(c.id) || (currentTeacher && c.departmentId === currentTeacher.departmentId)
  );

  return (
    <div className="space-y-8">
      {/* Teacher Profile Banner featuring Official Logo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-[#C62828] font-bold text-xl flex items-center justify-center border border-red-200">
            {currentUser?.name ? currentUser.name.charAt(0) : 'T'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{currentUser?.name || 'Faculty Member'}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Employee ID: <span className="font-semibold text-slate-700">{currentTeacher?.employeeId || 'EMP-1001'}</span> • {currentTeacher?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge status="Active">Academic Staff</Badge>
          <Logo size="md" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{myCourses.length}</h3>
              <p className="text-xs font-medium text-slate-500">My Assigned Courses</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-100 text-[#C62828]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{myExams.length}</h3>
              <p className="text-xs font-medium text-slate-500">My Assigned Exams</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{mySchedules.length}</h3>
              <p className="text-xs font-medium text-slate-500">Scheduled Sessions</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{myResults.length}</h3>
              <p className="text-xs font-medium text-slate-500">Recorded Results</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Courses */}
        <Card 
          title="My Assigned Courses" 
          subtitle="Courses under your instructional scope"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/courses')} icon={ArrowRight}>
              View Catalog
            </Button>
          }
        >
          {myCourses.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No assigned courses found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myCourses.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
                      {c.courseCode}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1">{c.courseName}</h4>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{c.creditHours} Credits</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* My Examination Duties */}
        <Card 
          title="My Examination Duties" 
          subtitle="Exams you are supervising or coordinating"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/exams')} icon={ArrowRight}>
              Manage Exams
            </Button>
          }
        >
          {myExams.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No examination duties assigned yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myExams.map((exam) => (
                <div key={exam.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{exam.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Type: <span className="font-semibold">{exam.examType}</span> • Marks: {exam.totalMarks}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={exam.status}>{exam.status}</Badge>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(exam.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
