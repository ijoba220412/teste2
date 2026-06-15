'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IMedicamentoPadrao, ApresentacaoMedicamento } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function MedicamentosList() {
  const [medicamentos, setMedicamentos] = useState<IMedicamentoPadrao[]>([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState<IMedicamentoPadrao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [nome, setNome] = useState('');
  const [apresentacao, setApresentacao] = useState<ApresentacaoMedicamento>(ApresentacaoMedicamento.COMPRIMIDO);
  const [indicacao, setIndicacao] = useState('');

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  const fetchMedicamentos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'medicamentos_padrao'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as IMedicamentoPadrao));
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setMedicamentos(data);
      setFilteredMedicamentos(data);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term) {
      setFilteredMedicamentos(medicamentos);
      return;
    }
    const filtered = medicamentos.filter(m => 
      m.nome.includes(term) || 
      m.indicacao?.includes(term)
    );
    setFilteredMedicamentos(filtered);
  };

  const handleOpenForm = (med?: IMedicamentoPadrao) => {
    if (med) {
      setEditingId(med.id || null);
      setNome(med.nome);
      setApresentacao(med.apresentacao);
      setIndicacao(med.indicacao || '');
    } else {
      setEditingId(null);
      setNome('');
      setApresentacao(ApresentacaoMedicamento.COMPRIMIDO);
      setIndicacao('');
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      alert('NOME DO MEDICAMENTO É OBRIGATÓRIO');
      return;
    }

    try {
      const medicamentoData = {
        nome: nome.toUpperCase().trim(),
        apresentacao,
        indicacao: indicacao.toUpperCase().trim(),
        criado_em: Timestamp.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'medicamentos_padrao', editingId), medicamentoData);
      } else {
        await addDoc(collection(db, 'medicamentos_padrao'), medicamentoData);
      }

      setShowForm(false);
      fetchMedicamentos();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      alert('ERRO AO SALVAR MEDICAMENTO');
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`TEM CERTEZA QUE DESEJA EXCLUIR "${nome}"?`)) {
      try {
        await deleteDoc(doc(db, 'medicamentos_padrao', id));
        fetchMedicamentos();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('ERRO AO EXCLUIR MEDICAMENTO');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">CARREGANDO MEDICAMENTOS...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Gerenciar Medicamentos</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <SearchBar onSearch={handleSearch} placeholder="FILTRAR MEDICAMENTOS..." />
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold uppercase shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold uppercase mb-4">
              {editingId ? 'EDITAR MEDICAMENTO' : 'NOVO MEDICAMENTO'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Nome do Medicamento *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="EX: PARACETAMOL"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-1">Apresentação *</label>
                <select
                  value={apresentacao}
                  onChange={(e) => setApresentacao(e.target.value as ApresentacaoMedicamento)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {Object.values(ApresentacaoMedicamento).map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-1">Indicação (Pra Que Serve?)</label>
                <textarea
                  value={indicacao}
                  onChange={(e) => setIndicacao(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="EX: DOR DE CABEÇA, FEBRE"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-bold uppercase"
                >
                  SALVAR
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 font-bold uppercase"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredMedicamentos.length === 0 ? (
            <li className="p-8 text-center text-gray-500 uppercase">
              {medicamentos.length === 0 
                ? 'Nenhum medicamento cadastrado. Clique em "NOVO" para adicionar.'
                : 'Nenhum medicamento encontrado com este filtro.'}
            </li>
          ) : (
            filteredMedicamentos.map((med) => (
              <li key={med.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                <div>
                  <p className="text-lg font-bold text-gray-900 uppercase">{med.nome}</p>
                  <p className="text-sm text-gray-500 uppercase">
                    {med.apresentacao} • {med.indicacao || 'Sem indicação cadastrada'}
                  </p>
                </div>
                <div className="flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenForm(med)}
                    className="text-indigo-600 hover:text-indigo-900 p-2 bg-indigo-50 rounded-full"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(med.id!, med.nome)}
                    className="text-red-600 hover:text-red-900 p-2 bg-red-50 rounded-full"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
