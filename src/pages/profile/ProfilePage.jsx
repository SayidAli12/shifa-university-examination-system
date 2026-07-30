import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Logo } from '../../components/common/Logo';
import { User, Mail, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, role } = useAuth();
  const { teachers, faculties, departments } = useData();

  const teacherProfile = teachers.find(
    t => t.email?.toLowerCase() === currentUser?.email?.toLowerCase() || t.userId === currentUser?.uid
  );

  const teacherFaculty = faculties.find(f => f.id === teacherProfile?.facultyId);
  const teacherDept = departments.find(d => d.id === teacherProfile?.departmentId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#C62828] font-bold text-2xl flex items-center justify-center border border-red-200 shadow-2xs">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentUser?.name || 'User Profile'}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{currentUser?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#C62828] px-2.5 py-0.5 rounded-full border border-red-100">
                {role} account
              </span>
              <Badge status={currentUser?.status || 'Active'}>
                {currentUser?.status || 'Active'}
              </Badge>
            </div>
          </div>
        </div>

        <Logo size="lg" />
      </div>

      {/* Account Details Card */}
      <Card title="Account Profile Details" subtitle="Institutional identity and access role">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <p className="text-base font-bold text-slate-900 mt-1">{currentUser?.name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">University Email</label>
              <p className="text-base font-semibold text-slate-800 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {currentUser?.email}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">System Access Role</label>
              <p className="text-sm font-bold text-[#C62828] mt-1 capitalize flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {role} (Granted via Firestore Role Management)
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            {role === 'teacher' && teacherProfile ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Employee ID</label>
                  <p className="text-sm font-bold text-slate-800 mt-1">{teacherProfile.employeeId}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Department Affiliation</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{teacherDept?.name || 'Computer Science'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Faculty Division</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{teacherFaculty?.name || 'Faculty of Information Technology'}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Administrative Authority</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">Full System & Academic Management Access</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Institutional Portal</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">Shifa University Examination Management System</p>
                </div>
              </>
            )}

            <div className="pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Account authenticated and active in system database.</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
