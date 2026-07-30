import React from 'react';

export const Select = ({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  required = false,
  placeholder = 'Select an option',
  valueKey = 'id',
  labelKey = 'name',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label} {required && <span className="text-[#C62828]">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-2xs">
        <select
          id={selectId}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C62828] px-3.5 py-2.5 bg-white ${
            error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-200 text-slate-900 hover:border-slate-300 focus:border-[#C62828]'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, idx) => {
            if (typeof opt === 'string') {
              return <option key={idx} value={opt}>{opt}</option>;
            }
            return (
              <option key={opt[valueKey] || idx} value={opt[valueKey]}>
                {opt[labelKey]}
              </option>
            );
          })}
        </select>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
