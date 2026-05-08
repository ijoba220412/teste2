import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  isTextArea?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, isTextArea = false, className = '', ...props }) => {
  const inputStyles = "w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0 outline-none transition-all uppercase text-teal-900 font-semibold";
  
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 uppercase">{label}</label>
      {isTextArea ? (
        <textarea className={`${inputStyles} min-h-[100px] normal-case`} {...(props as any)} />
      ) : (
        <input className={inputStyles} {...props} />
      )}
    </div>
  );
};