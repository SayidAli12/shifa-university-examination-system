import React from 'react';

export const LoadingSpinner = ({ message = 'Loading details...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <div className={`animate-spin rounded-full border-t-[#C62828] border-r-transparent border-b-[#C62828] border-l-transparent ${sizeClasses[size]}`} />
      {message && <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );
};
