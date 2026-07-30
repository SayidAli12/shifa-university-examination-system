import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginWithEmailPassword, 
  logoutUser, 
  subscribeToAuthChanges 
} from '../firebase/auth';
import { 
  isDemoMode, 
  firebaseStatus as initialFirebaseStatus, 
  missingFirebaseVars, 
  firebaseError as initialFirebaseError,
  testFirestoreConnection 
} from '../firebase/config';
import { initialSeedData } from '../utils/seedData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [status, setStatus]           = useState(initialFirebaseStatus);
  const [connError, setConnError]     = useState(initialFirebaseError);

  useEffect(() => {
    // Run Firestore connectivity check if credentials exist
    if (missingFirebaseVars.length === 0) {
      setStatus('CONNECTING');
      testFirestoreConnection().then(({ status: newStatus, error: newErr }) => {
        setStatus(newStatus);
        setConnError(newErr);
      });
    } else {
      setStatus('CONFIG_MISSING');
    }

    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginWithEmailPassword(email, password);
      setCurrentUser(user);
      // Persist Demo Mode session across page refreshes
      if (isDemoMode) {
        sessionStorage.setItem('university_demo_user', JSON.stringify(user));
      }
      return user;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      sessionStorage.removeItem('university_demo_user');
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo login — available in Demo Mode only
  const loginAsDemoRole = async (roleType) => {
    setIsLoading(true);
    const demoUser = initialSeedData.users.find(u => u.role === roleType) || initialSeedData.users[0];
    const userPayload = {
      uid: demoUser.uid,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      status: demoUser.status
    };
    setCurrentUser(userPayload);
    sessionStorage.setItem('university_demo_user', JSON.stringify(userPayload));
    setIsLoading(false);
    return userPayload;
  };

  const value = {
    currentUser,
    role: currentUser?.role || null,
    isAuthenticated: !!currentUser,
    isLoading,
    isDemoMode,
    firebaseStatus: status,
    missingFirebaseVars,
    firebaseError: connError,
    error,
    login,
    logout,
    loginAsDemoRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
