'use client';

import { useState, useEffect } from 'react';
import { maskCEP } from '@/lib/utils';

interface AddressData {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface CepAutoCompleteProps {
  onAddressFound: (address: AddressData) => void;
  cepValue: string;
  onCepChange: (cep: string) => void;
}

export default function CepAutoComplete({ 
  onAddressFound, 
  cepValue, 
  onCepChange 
}: CepAutoCompleteProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Remove máscara para validação
    const cleanCep = cepValue.replace(/\D/g, '');
    
    // Busca automática quando CEP atinge 8 dígitos
    if (cleanCep.length === 8) {
      fetchAddress(cleanCep);
    }
  }, [cepValue]);

  const fetchAddress = async (cep: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('CEP não encontrado');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP inválido');
      }
      
      // Converte todos os dados para UPPERCASE antes de retornar
      const addressData: AddressData = {
        rua: data.logradouro.toUpperCase(),
        bairro: data.bairro.toUpperCase(),
        cidade: data.localidade.toUpperCase(),
        uf: data.uf.toUpperCase(),
      };
      
      onAddressFound(addressData);
    } catch (err) {
      setError('CEP NÃO ENCONTRADO. PREENCHA MANUALMENTE.');
      console.error('Erro ao buscar CEP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCEP(e.target.value);
    onCepChange(maskedValue);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
        CEP *
      </label>
      <input
        type="text"
        value={cepValue}
        onChange={handleChange}
        placeholder="00000-000"
        maxLength={9}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      {loading && (
        <span className="absolute right-3 top-9 text-xs text-blue-600 font-bold uppercase animate-pulse">
          BUSCANDO...
        </span>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-bold uppercase">{error}</p>
      )}
    </div>
  );
}
