import React from 'react';

interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = 'Selecione...',
  disabled = false,
  error
}) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`
            w-full p-4 bg-gray-50 border-2 rounded-xl outline-none transition-all 
            uppercase text-teal-900 font-semibold appearance-none cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-400 focus:border-red-500' 
              : 'border-gray-100 focus:border-teal-500'
            }
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-600">
          ▼
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 ml-1 uppercase font-bold">{error}</p>
      )}
    </div>
  );
};
