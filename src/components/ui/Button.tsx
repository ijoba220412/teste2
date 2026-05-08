import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95";
  
  const variants = {
    primary: "bg-teal-700 text-teal-50 hover:bg-teal-600 shadow-teal-900/20",
    secondary: "bg-teal-100 text-teal-800 hover:bg-teal-200",
    outline: "border-2 border-teal-700 text-teal-700 hover:bg-teal-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};