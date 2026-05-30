'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Instituicao } from '@/types';
import { Pencil, Trash2, Plus, Building2 } from 'lucide-react';

export default function InstituicoesPage() {
  const [instituicoes, setInstituicoes] = useState<Array<Instituicao & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    pais: '',
    telefone1: '',
    telefone2: '',
    tipo: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'instituicoes'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<Instituicao & { id: string }>;
      setInstituicoes(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'instituicoes', editingId), formData);
      } else {
        await addDoc(collection(db, 'instituicoes'), formData);
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar instituição:', error);
      alert('ERRO AO SALVAR INSTITUIÇÃO');
    }
  };

  const handleEdit = (instituicao: Instituicao & { id: string }) => {
    setFormData({
      nome: instituicao.nome || '',
      descricao: instituicao.descricao || '',
      rua: instituicao.rua || '',
      numero: instituicao.numero || '',
      complemento: instituicao.complemento || '',
      bairro: instituicao.bairro || '',
      cidade: instituicao.cidade || '',
      uf: instituicao.uf || '',
      cep: instituicao.cep || '',
      pais: instituicao.pais || '',
      telefone1: instituicao.telefone1 || '',
      telefone2: instituicao.telefone2 || '',
      tipo: instituicao.tipo || '',
      email: instituicao.email || '',
      website: instituicao.website || '',
    });
    setEditingId(instituicao.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('CONFIRMA EXCLUSÃO DESTA INSTITUIÇÃO?')) {
      try {
        await deleteDoc(doc(db, 'instituicoes', id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('ERRO AO EXCLUIR INSTITUIÇÃO');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      pais: '',
      telefone1: '',
      telefone2: '',
      tipo: '',
      email: '',
      website: '',
    });
    setEditingId(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-teal-700 text-xl uppercase font-semibold">CARREGANDO...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase">INSTITUIÇÕES</h1>
            <p className="text-gray-600 mt-1 uppercase">GERENCIE AS INSTITUIÇÕES DE SAÚDE</p>
          </div>
          <button
            onClick={openNewModal}
            className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all uppercase font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            NOVA INSTITUIÇÃO
          </button>
        </div>

        {/* LISTA DE INSTITUIÇÕES */}
        <div className="grid gap-6">
          {instituicoes.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-6 h-6 text-teal-700" />
                    <h2 className="text-xl font-bold text-gray-900 uppercase">{inst.nome}</h2>
                  </div>
                  
                  <p className="text-gray-600 mb-4 uppercase">{inst.descricao}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 uppercase font-semibold">ENDEREÇO</p>
                      <p className="text-gray-700 uppercase">
                        {inst.rua}, {inst.numero} {inst.complemento && `- ${inst.complemento}`}
                      </p>
                      <p className="text-gray-700 uppercase">
                        {inst.bairro} - {inst.cidade}/{inst.uf}
                      </p>
                      <p className="text-gray-700 uppercase">CEP: {inst.cep}</p>
                      {inst.pais && <p className="text-gray-700 uppercase">{inst.pais}</p>}
                    </div>
                    
                    <div>
                      <p className="text-gray-500 uppercase font-semibold">CONTATO</p>
                      <p className="text-gray-700 uppercase">TEL: {inst.telefone1}</p>
                      {inst.telefone2 && <p className="text-gray-700 uppercase">TEL2: {inst.telefone2}</p>}
                      {inst.email && <p className="text-gray-700 uppercase">EMAIL: {inst.email}</p>}
                      {inst.website && <p className="text-gray-700 uppercase">SITE: {inst.website}</p>}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {inst.tipo}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(inst)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="EDITAR"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(inst.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="EXCLUIR"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {instituicoes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 uppercase font-semibold">NENHUMA INSTITUIÇÃO CADASTRADA</p>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 uppercase">
                {editingId ? 'EDITAR INSTITUIÇÃO' : 'NOVA INSTITUIÇÃO'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid gap-6">
                {/* INFORMAÇÕES BÁSICAS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">INFORMAÇÕES BÁSICAS</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">NOME *</label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">TIPO *</label>
                      <input
                        type="text"
                        required
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">DESCRIÇÃO COMPLETA *</label>
                      <input
                        type="text"
                        required
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* ENDEREÇO */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">ENDEREÇO</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">RUA *</label>
                      <input
                        type="text"
                        required
                        value={formData.rua}
                        onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">NÚMERO *</label>
                      <input
                        type="text"
                        required
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">COMPLEMENTO</label>
                      <input
                        type="text"
                        value={formData.complemento}
                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">BAIRRO *</label>
                      <input
                        type="text"
                        required
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">CIDADE *</label>
                      <input
                        type="text"
                        required
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">UF *</label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={formData.uf}
                        onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">CEP *</label>
                      <input
                        type="text"
                        required
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">PAÍS</label>
                      <input
                        type="text"
                        value={formData.pais}
                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* CONTATO */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">CONTATO</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">TELEFONE 1 *</label>
                      <input
                        type="text"
                        required
                        value={formData.telefone1}
                        onChange={(e) => setFormData({ ...formData, telefone1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">TELEFONE 2</label>
                      <input
                        type="text"
                        value={formData.telefone2}
                        onChange={(e) => setFormData({ ...formData, telefone2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">EMAIL</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">WEBSITE</label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTÕES */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors uppercase font-semibold"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-700 text-white rounded-xl hover:bg-teal-600 transition-colors uppercase font-semibold shadow-lg"
                >
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR INSTITUIÇÃO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
