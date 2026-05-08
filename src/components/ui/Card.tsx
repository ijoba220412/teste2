import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-lg border border-teal-50 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-black text-teal-800 uppercase tracking-tight">{title}</h2>
    {subtitle && <p className="text-sm text-teal-600 uppercase font-medium">{subtitle}</p>}
  </div>
);