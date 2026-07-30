import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { Login } from '../pages/Login';
import { Unauthorized } from '../pages/Unauthorized';
import { AdminDashboard } from '../pages/dashboard/AdminDashboard';
import { TeacherDashboard } from '../pages/dashboard/TeacherDashboard';
import { FacultyList } from '../pages/faculties/FacultyList';
import { DepartmentList } from '../pages/departments/DepartmentList';
import { CourseList } from '../pages/courses/CourseList';
import { TeacherList } from '../pages/teachers/TeacherList';
import { ExamList } from '../pages/exams/ExamList';
import { ScheduleList } from '../pages/schedules/ScheduleList';
import { ResultsList } from '../pages/results/ResultsList';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { UserList } from '../pages/users/UserList';
import { ProfilePage } from '../pages/profile/ProfilePage';

// Root redirector based on authenticated user's role
const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/teacher-dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes inside Main Horizontal Navbar Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />
        
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Faculties (Admin Only) */}
        <Route
          path="/faculties"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FacultyList />
            </ProtectedRoute>
          }
        />

        {/* Departments (Admin Only) */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentList />
            </ProtectedRoute>
          }
        />

        {/* Courses (Admin & Teacher) */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <CourseList />
            </ProtectedRoute>
          }
        />

        {/* Teachers (Admin Only) */}
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeacherList />
            </ProtectedRoute>
          }
        />

        {/* Exams (Admin & Teacher) */}
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ExamList />
            </ProtectedRoute>
          }
        />

        {/* Schedules (Admin & Teacher) */}
        <Route
          path="/schedules"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ScheduleList />
            </ProtectedRoute>
          }
        />

        {/* Results (Admin & Teacher) */}
        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ResultsList />
            </ProtectedRoute>
          }
        />

        {/* Reports (Admin & Teacher) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* User Management (Admin Only) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserList />
            </ProtectedRoute>
          }
        />

        {/* Profile (Admin & Teacher) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
