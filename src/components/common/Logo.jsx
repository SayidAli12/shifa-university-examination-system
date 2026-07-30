import React from 'react';
import logoImg from '../../assets/logo/logo.jpg';

export const Logo = ({ size = 'md', className = '', showText = false, textClassName = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    print: 'w-20 h-20'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logoImg}
        alt="Shifa University Logo"
        className={`${sizeClasses[size] || sizeClasses.md} object-contain rounded-full shadow-2xs`}
      />
      {showText && (
        <div>
          <span className={`text-base font-bold tracking-tight text-slate-900 block leading-tight ${textClassName}`}>
            Shifa <span className="text-[#C62828]">University</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            Examination System
          </span>
        </div>
      )}
    </div>
  );
};
