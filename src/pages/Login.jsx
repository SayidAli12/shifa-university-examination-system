import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { Lock, Mail, AlertCircle, ShieldCheck, FlaskConical } from 'lucide-react';

export const Login = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, loginAsDemoRole, isDemoMode, firebaseStatus, firebaseError } = useAuth();
  const navigate = useNavigate();

  const redirect = (role) => {
    if (role === 'admin') navigate('/admin-dashboard');
    else navigate('/teacher-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email, password);
      redirect(user.role);
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (roleType) => {
    setSubmitting(true);
    setLocalError('');
    try {
      const user = await loginAsDemoRole(roleType);
      redirect(user.role);
    } catch (err) {
      setLocalError('Failed to initialize demo account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl">

        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <Logo size="xl" className="mb-3" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Shifa <span className="text-[#C62828]">University</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Examination Management System
          </p>
          {/* Mode indicators */}
          {firebaseStatus === 'LIVE' && (
            <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Firebase Mode
            </span>
          )}
          {firebaseStatus === 'CONFIG_MISSING' && (
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              <FlaskConical className="w-3 h-3" /> Demo Mode Active
            </span>
          )}
          {firebaseStatus === 'ERROR' && (
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3 text-red-600" /> Firebase Error
            </span>
          )}
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-[#C62828] flex-shrink-0 mt-0.5" />
            <span>{localError}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@university.edu"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm font-semibold"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          </Button>
        </form>

        {/* Quick Demo Access — shown in Demo Mode only */}
        {isDemoMode && (
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                disabled={submitting}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 text-[#C62828] bg-red-50/50 hover:bg-red-50 transition-colors text-center cursor-pointer disabled:opacity-50"
              >
                Login as Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher')}
                disabled={submitting}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer disabled:opacity-50"
              >
                Login as Teacher
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Demo Mode — data resets on page refresh
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
