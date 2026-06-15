'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IInstituicao, TipoInstituicao } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';
import { PencilIcon, TrashIcon, PlusIcon, BuildingOfficeIcon } from 'lucide-react';

export default function InstituicoesPage() {
  const [instituicoes, setInstituicoes] = useState<IInstituicao[]>([]);
  const [filtered, setFiltered] = useState<IInstituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    tipo: TipoInstituicao.HOSPITAL,
    telefone1: '',
    telefone2: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: 'RJ',
    email: '',
    website: ''
  });

  useEffect(() => {
    fetchInstituicoes();
  }, []);

  const fetchInstituicoes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'instituicoes'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as IInstituicao));
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setInstituicoes(data);
      setFiltered(data);
    } catch (error) {
      console.error("Erro ao buscar instituições:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term) {
      setFiltered(instituicoes);
      return;
    }
    const filteredData = instituicoes.filter(i => 
      i.nome.includes(term) || 
      (i.descricao && i.descricao.includes(term)) ||
      (i.cidade && i.cidade.includes(term))
    );
    setFiltered(filteredData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...form,
        nome: form.nome.toUpperCase(),
        descricao: form.descricao?.toUpperCase(),
        tipo: form.tipo,
        rua: form.rua?.toUpperCase(),
        bairro: form.bairro?.toUpperCase(),
        cidade: form.cidade?.toUpperCase(),
        uf: form.uf.toUpperCase(),
        updated_at: Timestamp.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'instituicoes', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'instituicoes'), dataToSave);
      }

      resetForm();
      fetchInstituicoes();
    } catch (error) {
      console.error("Erro ao salvar instituição:", error);
      alert("ERRO AO SALVAR INSTITUIÇÃO");
    }
  };

  const handleEdit = (inst: IInstituicao & { id: string }) => {
    setForm({
      nome: inst.nome || '',
      descricao: inst.descricao || '',
      tipo: inst.tipo || TipoInstituicao.HOSPITAL,
      telefone1: inst.telefone1 || '',
      telefone2: inst.telefone2 || '',
      cep: inst.cep || '',
      rua: inst.rua || '',
      numero: inst.numero || '',
      complemento: inst.complemento || '',
      bairro: inst.bairro || '',
      cidade: inst.cidade || '',
      uf: inst.uf || 'RJ',
      email: inst.email || '',
      website: inst.website || ''
    });
    setEditingId(inst.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`TEM CERTEZA QUE DESEJA EXCLUIR A INSTITUIÇÃO ${nome}?`)) {
      try {
        await deleteDoc(doc(db, 'instituicoes', id));
        fetchInstituicoes();
      } catch (error) {
        alert("ERRO AO EXCLUIR INSTITUIÇÃO");
      }
    }
  };

  const resetForm = () => {
    setForm({
      nome: '',
      descricao: '',
      tipo: TipoInstituicao.HOSPITAL,
      telefone1: '',
      telefone2: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: 'RJ',
      email: '',
      website: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCepBlur = async () => {
    const cep = form.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            rua: data.logradouro.toUpperCase(),
            bairro: data.bairro.toUpperCase(),
            cidade: data.localidade.toUpperCase(),
            uf: data.uf.toUpperCase()
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">CARREGANDO DADOS...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <BuildingOfficeIcon className="w-8 h-8 text-teal-700" />
          <h1 className="text-2xl font-bold text-gray-800 uppercase">GERENCIAR INSTITUIÇÕES</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <SearchBar onSearch={handleSearch} placeholder="FILTRAR INSTITUIÇÕES..." />
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold uppercase shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {showForm ? 'CANCELAR' : 'NOVA'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 uppercase">{editingId ? 'EDITAR INSTITUIÇÃO' : 'NOVA INSTITUIÇÃO'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1 uppercase">NOME DA INSTITUIÇÃO *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({...form, nome: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">TIPO *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({...form, tipo: e.target.value as TipoInstituicao})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  required
                >
                  {Object.values(TipoInstituicao).map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">DESCRIÇÃO</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({...form, descricao: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">TELEFONE 1</label>
                <input
                  type="tel"
                  value={form.telefone1}
                  onChange={(e) => setForm({...form, telefone1: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  placeholder="(XX) XXXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">TELEFONE 2</label>
                <input
                  type="tel"
                  value={form.telefone2}
                  onChange={(e) => setForm({...form, telefone2: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  placeholder="(XX) XXXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">CEP</label>
                <input
                  type="text"
                  value={form.cep}
                  onChange={(e) => setForm({...form, cep: e.target.value})}
                  onBlur={handleCepBlur}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">CIDADE</label>
                <input
                  type="text"
                  value={form.cidade}
                  onChange={(e) => setForm({...form, cidade: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">RUA</label>
                <input
                  type="text"
                  value={form.rua}
                  onChange={(e) => setForm({...form, rua: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">NÚMERO</label>
                <input
                  type="text"
                  value={form.numero}
                  onChange={(e) => setForm({...form, numero: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">BAIRRO</label>
                <input
                  type="text"
                  value={form.bairro}
                  onChange={(e) => setForm({...form, bairro: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 uppercase">COMPLEMENTO</label>
                <input
                  type="text"
                  value={form.complemento}
                  onChange={(e) => setForm({...form, complemento: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
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
                <label className="block text-sm font-bold mb-1 uppercase">WEBSITE</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm({...form, website: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded uppercase font-semibold"
                />
              </div>
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
            <li className="p-8 text-center text-gray-500 uppercase">NENHUMA INSTITUIÇÃO ENCONTRADA.</li>
          ) : (
            filtered.map((inst) => (
              <li key={inst.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                <div>
                  <p className="text-lg font-bold text-gray-900 uppercase">{inst.nome}</p>
                  <p className="text-sm text-gray-500 uppercase">
                    {inst.tipo} {inst.cidade && `• ${inst.cidade} - ${inst.uf}`}
                  </p>
                  {inst.telefone1 && (
                    <p className="text-xs text-gray-400 uppercase mt-1">
                      TEL: {inst.telefone1}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(inst)} className="text-indigo-600 hover:text-indigo-900 p-2 bg-indigo-50 rounded-full">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(inst.id!, inst.nome)} className="text-red-600 hover:text-red-900 p-2 bg-red-50 rounded-full">
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
