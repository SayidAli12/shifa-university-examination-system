import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToCollection, 
  createDocument, 
  updateDocument, 
  deleteDocument
} from '../firebase/firestoreService';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { isAuthenticated, isDemoMode } = useAuth();
  const [faculties,     setFaculties]     = useState([]);
  const [departments,   setDepartments]   = useState([]);
  const [courses,       setCourses]       = useState([]);
  const [teachers,      setTeachers]      = useState([]);
  const [exams,         setExams]         = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [results,       setResults]       = useState([]);
  const [usersList,     setUsersList]     = useState([]);
  const [permissionError, setPermissionError] = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);

  // Subscribe to collections when authenticated or in Demo Mode
  useEffect(() => {
    setPermissionError(null);

    // In Live Mode, wait until the user is authenticated before opening Firestore listeners
    if (!isDemoMode && !isAuthenticated) {
      setFaculties([]);
      setDepartments([]);
      setCourses([]);
      setTeachers([]);
      setExams([]);
      setExamSchedules([]);
      setResults([]);
      setUsersList([]);
      setIsLoading(false);
      return;
    }

    const handleSubError = (err) => {
      console.error('[Firestore Permission Error]:', err);
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission-denied'))) {
        setPermissionError('Firestore permission denied. Your user profile does not have authorization for this collection.');
      }
    };

    const u1 = subscribeToCollection('faculties',     setFaculties, handleSubError);
    const u2 = subscribeToCollection('departments',   setDepartments, handleSubError);
    const u3 = subscribeToCollection('courses',       setCourses, handleSubError);
    const u4 = subscribeToCollection('teachers',      setTeachers, handleSubError);
    const u5 = subscribeToCollection('exams',         setExams, handleSubError);
    const u6 = subscribeToCollection('examSchedules', setExamSchedules, handleSubError);
    const u7 = subscribeToCollection('results',       setResults, handleSubError);
    const u8 = subscribeToCollection('users',         setUsersList, handleSubError);

    setIsLoading(false);

    return () => {
      [u1, u2, u3, u4, u5, u6, u7, u8].forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [isAuthenticated, isDemoMode]);

  // ── FACULTIES ─────────────────────────────────────────────────────────────
  const addFaculty    = (data)     => createDocument('faculties', data);
  const updateFaculty = (id, data) => updateDocument('faculties', id, data);
  const deleteFaculty = (id)       => deleteDocument('faculties', id);

  // ── DEPARTMENTS ───────────────────────────────────────────────────────────
  const addDepartment    = (data)     => createDocument('departments', data);
  const updateDepartment = (id, data) => updateDocument('departments', id, data);
  const deleteDepartment = (id)       => deleteDocument('departments', id);

  // ── COURSES ───────────────────────────────────────────────────────────────
  const addCourse    = (data)     => createDocument('courses', data);
  const updateCourse = (id, data) => updateDocument('courses', id, data);
  const deleteCourse = (id)       => deleteDocument('courses', id);

  // ── TEACHERS ──────────────────────────────────────────────────────────────
  const addTeacher    = (data)     => createDocument('teachers', data);
  const updateTeacher = (id, data) => updateDocument('teachers', id, data);
  const deleteTeacher = (id)       => deleteDocument('teachers', id);

  // ── EXAMS ─────────────────────────────────────────────────────────────────
  const addExam    = (data)     => createDocument('exams', data);
  const updateExam = (id, data) => updateDocument('exams', id, data);
  const deleteExam = (id)       => deleteDocument('exams', id);

  // ── SCHEDULES ─────────────────────────────────────────────────────────────
  const addSchedule    = (data)     => createDocument('examSchedules', data);
  const updateSchedule = (id, data) => updateDocument('examSchedules', id, data);
  const deleteSchedule = (id)       => deleteDocument('examSchedules', id);

  // ── RESULTS ───────────────────────────────────────────────────────────────
  const addResult    = (data)     => createDocument('results', data);
  const updateResult = (id, data) => updateDocument('results', id, data);
  const deleteResult = (id)       => deleteDocument('results', id);

  // ── USERS ─────────────────────────────────────────────────────────────────
  const updateUserStatus = (id, status) => updateDocument('users', id, { status });

  const value = {
    faculties, departments, courses, teachers,
    exams, examSchedules, results, usersList,
    isLoading, permissionError,
    addFaculty, updateFaculty, deleteFaculty,
    addDepartment, updateDepartment, deleteDepartment,
    addCourse, updateCourse, deleteCourse,
    addTeacher, updateTeacher, deleteTeacher,
    addExam, updateExam, deleteExam,
    addSchedule, updateSchedule, deleteSchedule,
    addResult, updateResult, deleteResult,
    updateUserStatus
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
