'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "BUSCAR POR NOME, CPF OU PRONTUÁRIO..." }: SearchBarProps) {
  const [term, setTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converte automaticamente para UPPERCASE antes de salvar/exibir
    const upperValue = e.target.value.toUpperCase();
    setTerm(upperValue);
    onSearch(upperValue);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase font-semibold tracking-wide transition-shadow shadow-sm"
        placeholder={placeholder}
        value={term}
        onChange={handleChange}
        autoComplete="off"
      />
    </div>
  );
}
