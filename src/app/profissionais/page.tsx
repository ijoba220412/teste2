'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Profissional } from '@/types';
import { Plus, Trash2, Stethoscope, Edit, Activity } from 'lucide-react';

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Array<Profissional & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nome: '',
    cargo: 'MÉDICO(A)',
    cargoOutro: '',
    numeroRegistro: '',
    orgao: 'CRM',
    uf: '',
    email: '',
    especialidade: '',
    local: '',
    observacoes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'profissionais'), orderBy('nome', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<Profissional & { id: string }>;
        setProfissionais(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar profissionais:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...form,
        nome: form.nome.toUpperCase(),
        cargo: form.cargo.toUpperCase(),
        cargoOutro: form.cargoOutro.toUpperCase(),
        orgao: form.orgao.toUpperCase(),
        uf: form.uf.toUpperCase(),
        especialidade: form.especialidade.toUpperCase(),
        local: form.local.toUpperCase(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'profissionais', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'profissionais'), dataToSave);
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      alert('ERRO AO SALVAR PROFISSIONAL');
    }
  };

  const handleEdit = (prof: Profissional & { id: string }) => {
    setForm({
      nome: prof.nome || '',
      cargo: prof.cargo || 'MÉDICO(A)',
      cargoOutro: prof.cargoOutro || '',
      numeroRegistro: prof.numeroRegistro || '',
      orgao: prof.orgao || 'CRM',
      uf: prof.uf || '',
      email: prof.email || '',
      especialidade: prof.especialidade || '',
      local: prof.local || '',
      observacoes: prof.observacoes || '',
    });
    
    // 🛡️ CORREÇÃO DO ERRO DE TIPO AQUI:
    // Garante que se prof.id for undefined, o estado recebe null
    setEditingId(prof.id ?? null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('CONFIRMA EXCLUSÃO DESTE PROFISSIONAL?')) {
      try {
        await deleteDoc(doc(db, 'profissionais', id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('ERRO AO EXCLUIR PROFISSIONAL');
      }
    }
  };

  const resetForm = () => {
    setForm({
      nome: '',
      cargo: 'MÉDICO(A)',
      cargoOutro: '',
      numeroRegistro: '',
      orgao: 'CRM',
      uf: '',
      email: '',
      especialidade: '',
      local: '',
      observacoes: ''
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO PROFISSIONAIS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-teal-700" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
            CADASTRO DE PROFISSIONAIS
          </h1>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">NOME COMPLETO *</label>
                <input
                  required
                  placeholder="EX: DR. RICARDO LUCAS DE SOUZA RODRIGUES"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">CARGO *</label>
                <select
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                >
                  <option value="MÉDICO(A)">MÉDICO(A)</option>
                  <option value="FARMACÊUTICO(A)">FARMACÊUTICO(A)</option>
                  <option value="ENFERMEIRO(A)">ENFERMEIRO(A)</option>
                  <option value="OUTRO">OUTRO</option>
                </select>
              </div>

              {form.cargo === 'OUTRO' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ESPECIFIQUE O CARGO *</label>
                  <input
                    required
                    placeholder="EX: NUTRICIONISTA"
                    value={form.cargoOutro}
                    onChange={e => setForm({ ...form, cargoOutro: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">NÚMERO DE REGISTRO *</label>
                <input
                  required
                  placeholder="EX: 123456"
                  value={form.numeroRegistro}
                  onChange={e => setForm({ ...form, numeroRegistro: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ÓRGÃO *</label>
                <select
                  required
                  value={form.orgao}
                  onChange={e => setForm({ ...form, orgao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                >
                  <option value="CRM">CRM</option>
                  <option value="CRF">CRF</option>
                  <option value="COREN">COREN</option>
                  <option value="CRN">CRN</option>
                  <option value="CREFITO">CREFITO</option>
                  <option value="OUTRO">OUTRO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">UF *</label>
                <input
                  required
                  maxLength={2}
                  placeholder="EX: RJ"
                  value={form.uf}
                  onChange={e => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ESPECIALIDADE</label>
                <input
                  placeholder="EX: ONCOLOGIA"
                  value={form.especialidade}
                  onChange={e => setForm({ ...form, especialidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">EMAIL</label>
                <input
                  type="email"
                  placeholder="EX: CONTATO@HOSPITAL.COM"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">LOCAL DE ATENDIMENTO</label>
                <input
                  placeholder="EX: HOSPITAL DAS CLÍNICAS"
                  value={form.local}
                  onChange={e => setForm({ ...form, local: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">OBSERVAÇÕES</label>
                <textarea
                  rows={3}
                  placeholder="INFORMAÇÕES ADICIONAIS"
                  value={form.observacoes}
                  onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors shadow-lg"
              >
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'ATUALIZAR PROFISSIONAL' : 'CADASTRAR PROFISSIONAL'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors uppercase font-semibold"
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTA DE PROFISSIONAIS */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {profissionais.length === 0 ? (
            <div className="text-center py-16">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold uppercase">
                NENHUM PROFISSIONAL CADASTRADO
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {profissionais.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Stethoscope className="w-5 h-5 text-teal-700" />
                      <p className="font-bold text-gray-900 text-lg uppercase">{p.nome}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 uppercase">
                      <p>
                        <span className="font-semibold">CARGO:</span> {p.cargo === 'OUTRO' ? p.cargoOutro : p.cargo}
                      </p>
                      <p>
                        <span className="font-semibold">REGISTRO:</span> {p.orgao}/{p.uf} {p.numeroRegistro}
                      </p>
                      {p.especialidade && <p><span className="font-semibold">ESPECIALIDADE:</span> {p.especialidade}</p>}
                      {p.local && <p><span className="font-semibold">LOCAL:</span> {p.local}</p>}
                      {p.email && <p><span className="font-semibold">EMAIL:</span> {p.email}</p>}
                    </div>
                    
                    {p.observacoes && (
                      <p className="text-xs text-gray-500 mt-2 uppercase italic">
                        OBS: {p.observacoes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="EDITAR"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="EXCLUIR"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
