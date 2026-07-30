import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, User, GraduationCap, ChevronDown } from 'lucide-react';

export const MobileNav = ({
  isOpen,
  onClose,
  navItems = [],
  academicsItems = [],
  currentUser,
  role,
  onLogout
}) => {
  const [academicsOpen, setAcademicsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 shadow-lg animate-in slide-in-from-top-2">
      <div className="space-y-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          // Insert Academics group right before the Teachers item (admin only)
          if (item.label === 'Teachers' && academicsItems.length > 0) {
            return (
              <React.Fragment key="academics-mobile-group">
                {/* ── Academics Expandable Section ── */}
                <button
                  onClick={() => setAcademicsOpen((prev) => !prev)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <GraduationCap className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">Academics</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      academicsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {academicsOpen && (
                  <div className="ml-4 pl-4 border-l-2 border-red-100 space-y-0.5">
                    {academicsItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-red-50 text-[#C62828] font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`
                          }
                        >
                          <SubIcon className="w-4 h-4" />
                          {sub.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}

                {/* Then render Teachers item */}
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-50 text-[#C62828] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </React.Fragment>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-[#C62828] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}

        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-red-50 text-[#C62828] font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`
          }
        >
          <User className="w-5 h-5" />
          My Profile
        </NavLink>
      </div>

      <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 text-[#C62828] font-bold text-sm flex items-center justify-center">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
            <p className="text-[10px] uppercase font-semibold text-[#C62828]">{role}</p>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
