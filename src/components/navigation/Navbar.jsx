import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  Award,
  BarChart3,
  UserCog,
  User,
  LogOut, 
  Menu,
  X,
  AlertCircle,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { MobileNav } from './MobileNav';

// ── Academics dropdown items (admin only) ─────────────────────────────────────
const ACADEMICS_ITEMS = [
  { label: 'Faculties',    path: '/faculties',   icon: Building2 },
  { label: 'Departments',  path: '/departments',  icon: Layers    },
  { label: 'Courses',      path: '/courses',      icon: BookOpen  },
];

export const Navbar = () => {
  const { 
    currentUser, 
    role, 
    logout, 
    isDemoMode, 
    firebaseStatus, 
    missingFirebaseVars, 
    firebaseError, 
    loginAsDemoRole 
  } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [academicsOpen,     setAcademicsOpen]     = useState(false);
  const academicsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (academicsRef.current && !academicsRef.current.contains(e.target)) {
        setAcademicsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setAcademicsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Whether any academics sub-route is currently active
  const isAcademicsActive = ACADEMICS_ITEMS.some(item => location.pathname.startsWith(item.path));

  // Admin nav — Faculties/Departments/Courses are now inside the Academics dropdown
  const adminNavItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    // 'academics' is a special sentinel handled separately in JSX
    { label: 'Teachers',  path: '/teachers',         icon: Users           },
    { label: 'Exams',     path: '/exams',             icon: FileText        },
    { label: 'Schedule',  path: '/schedules',         icon: Calendar        },
    { label: 'Results',   path: '/results',           icon: Award           },
    { label: 'Reports',   path: '/reports',           icon: BarChart3       },
    { label: 'Users',     path: '/users',             icon: UserCog         },
  ];

  const teacherNavItems = [
    { label: 'Dashboard', path: '/teacher-dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '/courses',           icon: BookOpen        },
    { label: 'My Exams',   path: '/exams',             icon: FileText        },
    { label: 'Schedule',   path: '/schedules',         icon: Calendar        },
    { label: 'Results',    path: '/results',           icon: Award           },
    { label: 'Reports',    path: '/reports',           icon: BarChart3       },
  ];

  const navItems = role === 'admin' ? adminNavItems : teacherNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs print:hidden">
      {/* Firebase Status Banners */}
      {firebaseStatus === 'CONFIG_MISSING' && (
        <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Firebase Configuration Required — Configure VITE_FIREBASE_* credentials in .env for production Firestore.</span>
          {missingFirebaseVars && missingFirebaseVars.length > 0 && (
            <span className="text-[11px] bg-amber-600 px-2 py-0.5 rounded font-mono">
              Missing: {missingFirebaseVars.join(', ')}
            </span>
          )}
          {isDemoMode && (
            <div className="ml-2 inline-flex items-center gap-2 border-l border-amber-400 pl-2">
              <span className="text-[10px] uppercase font-bold tracking-wide">Demo Role:</span>
              <button 
                onClick={() => loginAsDemoRole('admin')} 
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${role === 'admin' ? 'bg-white text-amber-800' : 'bg-amber-600 hover:bg-amber-700'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => loginAsDemoRole('teacher')} 
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${role === 'teacher' ? 'bg-white text-amber-800' : 'bg-amber-600 hover:bg-amber-700'}`}
              >
                Teacher
              </button>
            </div>
          )}
        </div>
      )}

      {firebaseStatus === 'ERROR' && (
        <div className="bg-red-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Firebase Connection Error: {firebaseError || 'Initialization failed.'}</span>
        </div>
      )}

      {firebaseStatus === 'CONNECTING' && (
        <div className="bg-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>Connecting to Firebase...</span>
        </div>
      )}

      {/* Main Top Horizontal Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center gap-3">
            <Logo size="md" showText={true} />
          </NavLink>

          {/* Desktop Horizontal Navigation Items */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              // Insert the Academics dropdown right after Dashboard (for admin)
              if (item.label === 'Teachers' && role === 'admin') {
                return (
                  <React.Fragment key="academics-group">
                    {/* ── Academics Dropdown ── */}
                    <div className="relative" ref={academicsRef}>
                      <button
                        onClick={() => setAcademicsOpen((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all select-none ${
                          isAcademicsActive
                            ? 'bg-red-50 text-[#C62828] font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                        aria-haspopup="true"
                        aria-expanded={academicsOpen}
                        id="academics-dropdown-btn"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Academics
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            academicsOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Panel */}
                      {academicsOpen && (
                        <div
                          className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                          role="menu"
                        >
                          {ACADEMICS_ITEMS.map((sub) => {
                            const SubIcon = sub.icon;
                            return (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                role="menuitem"
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors mx-1 rounded-lg ${
                                    isActive
                                      ? 'bg-red-50 text-[#C62828] font-bold'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                  }`
                                }
                              >
                                <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                {sub.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Then render the Teachers item normally */}
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-red-50 text-[#C62828] font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </NavLink>
                  </React.Fragment>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-red-50 text-[#C62828] font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right User Status, Profile & Logout */}
          <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-4">
            {/* Live Mode Badge Indicator */}
            {firebaseStatus === 'LIVE' && (
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                title="Connected to Live Firebase Authentication & Firestore Database"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Mode</span>
              </div>
            )}

            <NavLink
              to="/profile"
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 text-[#C62828] font-bold text-xs flex items-center justify-center border border-red-200">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
                </p>
                <span className="text-[10px] font-semibold text-[#C62828] uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <MobileNav 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navItems={navItems}
        academicsItems={role === 'admin' ? ACADEMICS_ITEMS : []}
        currentUser={currentUser}
        role={role}
        onLogout={handleLogout}
      />
    </header>
  );
};
