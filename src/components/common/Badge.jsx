import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export const Badge = ({ children, status, className = '' }) => {
  const badgeStyle = status ? getStatusBadgeStyle(status) : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {children || status}
    </span>
  );
};
