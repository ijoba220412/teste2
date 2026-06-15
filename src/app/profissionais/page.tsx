'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IProfissional, CargoProfissional } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';
import { PencilIcon, TrashIcon, PlusIcon, UserGroupIcon } from 'lucide-react';

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<IProfissional[]>([]);
  const [filtered, setFiltered] = useState<IProfissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    nome: '',
    cargo: CargoProfissional.MEDICO,
    cargoOutro: '',
    especialidade: '',
    local: '',
    observacoes: '',
    email: '',
    orgao: '',
    numeroRegistro: '',
    uf: 'RJ'
  });

  useEffect(() => {
    fetchProfissionais();
  }, []);

  const fetchProfissionais = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'profissionais'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as IProfissional));
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setProfissionais(data);
      setFiltered(data);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term) {
      setFiltered(profissionais);
      return;
    }
    const filteredData = profissionais.filter(p => 
      p.nome.includes(term) || 
      (p.especialidade && p.especialidade.includes(term)) ||
      (p.numeroRegistro && p.numeroRegistro.includes(term))
    );
    setFiltered(filteredData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.cargo === CargoProfissional.FARMACEUTICO) {
      if (!form.numeroRegistro || !form.orgao || !form.uf) {
        alert("PARA FARMACÊUTICOS, NÚMERO DE REGISTRO, ÓRGÃO E UF SÃO OBRIGATÓRIOS");
        return;
      }
    }

    try {
      const dataToSave = {
        ...form,
        nome: form.nome.toUpperCase(),
        cargoOutro: form.cargoOutro?.toUpperCase(),
        especialidade: form.especialidade?.toUpperCase(),
        local: form.local?.toUpperCase(),
        observacoes: form.observacoes?.toUpperCase(),
        orgao: form.orgao?.toUpperCase(),
        uf: form.uf.toUpperCase(),
        updated_at: Timestamp.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'profissionais', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'profissionais'), dataToSave);
      }

      resetForm();
      fetchProfissionais();
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
      alert("ERRO AO SALVAR PROFISSIONAL");
    }
  };

  const handleEdit = (prof: IProfissional & { id: string }) => {
    setForm({
      nome: prof.nome || '',
      cargo: prof.cargo || CargoProfissional.MEDICO,
      cargoOutro: prof.cargoOutro || '',
      especialidade: prof.especialidade || '',
      local: prof.local || '',
      observacoes: prof.observacoes || '',
      email: prof.email || '',
      orgao: prof.orgao || '',
      numeroRegistro: prof.numeroRegistro || '',
      uf: prof.uf || 'RJ'
    });
    setEditingId(prof.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`TEM CERTEZA QUE DESEJA EXCLUIR O PROFISSIONAL ${nome}?`)) {
      try {
        await deleteDoc(doc(db, 'profissionais', id));
        fetchProfissionais();
      } catch (error) {
        alert("ERRO AO EXCLUIR PROFISSIONAL");
      }
    }
  };

  const resetForm = () => {
    setForm({
      nome: '',
      cargo: CargoProfissional.MEDICO,
      cargoOutro: '',
      especialidade: '',
      local: '',
      observacoes: '',
      email: '',
      orgao: '',
      numeroRegistro: '',
      uf: 'RJ'
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8 text-center">CARREGANDO DADOS...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-8 h-8 text-teal-700" />
          <h1 className="text-2xl font-bold text-gray-800 uppercase">GERENCIAR PROFISSIONAIS</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <SearchBar onSearch={handleSearch} placeholder="FILTRAR PROFISSIONAIS..." />
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold uppercase shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {showForm ? 'CANCELAR' : 'NOVO'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 uppercase">{editingId ? 'EDITAR PROFISSIONAL' : 'NOVO PROFISSIONAL'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 uppercase">NOME *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({...form, nome: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">CARGO *</label>
                <select
                  value={form.cargo}
                  onChange={(e) => setForm({...form, cargo: e.target.value as CargoProfissional})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  required
                >
                  {Object.values(CargoProfissional).map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>

              {form.cargo === CargoProfissional.OUTRO && (
                <div>
                  <label className="block text-sm font-bold mb-1 uppercase">ESPECIFICAR OUTRO CARGO</label>
                  <input
                    type="text"
                    value={form.cargoOutro}
                    onChange={(e) => setForm({...form, cargoOutro: e.target.value.toUpperCase()})}
                    className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">ESPECIALIDADE</label>
                <input
                  type="text"
                  value={form.especialidade}
                  onChange={(e) => setForm({...form, especialidade: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">LOCAL DE ATUAÇÃO</label>
                <input
                  type="text"
                  value={form.local}
                  onChange={(e) => setForm({...form, local: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">E-MAIL</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">ÓRGÃO DE CLASSE</label>
                <input
                  type="text"
                  value={form.orgao}
                  onChange={(e) => setForm({...form, orgao: e.target.value.toUpperCase()})}
                  className={`w-full p-2 border border-gray-300 rounded uppercase font-semibold ${form.cargo === CargoProfissional.FARMACEUTICO ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder={form.cargo === CargoProfissional.FARMACEUTICO ? 'OBRIGATÓRIO PARA FARMACÊUTICOS' : 'EX: CRM, COREN'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">NÚMERO DE REGISTRO</label>
                <input
                  type="text"
                  value={form.numeroRegistro}
                  onChange={(e) => setForm({...form, numeroRegistro: e.target.value.toUpperCase()})}
                  className={`w-full p-2 border border-gray-300 rounded uppercase font-semibold ${form.cargo === CargoProfissional.FARMACEUTICO ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder={form.cargo === CargoProfissional.FARMACEUTICO ? 'OBRIGATÓRIO PARA FARMACÊUTICOS' : 'EX: 123456'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">UF</label>
                <input
                  type="text"
                  value={form.uf}
                  onChange={(e) => setForm({...form, uf: e.target.value.toUpperCase().slice(0, 2)})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  maxLength={2}
                  placeholder="RJ"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 uppercase">OBSERVAÇÕES</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({...form, observacoes: e.target.value.toUpperCase()})}
                className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold uppercase hover:bg-green-700">
                {editingId ? 'ATUALIZAR' : 'SALVAR'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded font-bold uppercase hover:bg-gray-600">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <li className="p-8 text-center text-gray-500 uppercase">NENHUM PROFISSIONAL ENCONTRADO.</li>
          ) : (
            filtered.map((prof) => (
              <li key={prof.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                <div>
                  <p className="text-lg font-bold text-gray-900 uppercase">{prof.nome}</p>
                  <p className="text-sm text-gray-500 uppercase">
                    {prof.cargo} {prof.especialidade && `• ${prof.especialidade}`}
                  </p>
                  {(prof.numeroRegistro || prof.orgao) && (
                    <p className="text-xs text-gray-400 uppercase mt-1">
                      {prof.orgao && `${prof.orgao}: `}{prof.numeroRegistro} {prof.uf && `- ${prof.uf}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(prof)} className="text-indigo-600 hover:text-indigo-900 p-2 bg-indigo-50 rounded-full">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(prof.id!, prof.nome)} className="text-red-600 hover:text-red-900 p-2 bg-red-50 rounded-full">
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
