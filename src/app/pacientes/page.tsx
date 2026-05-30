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
import { Paciente, Instituicao } from '@/types';
import { Plus, Trash2, Users, Edit, Activity, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Array<Paciente & { id: string }>>([]);
  const [instituicoes, setInstituicoes] = useState<Array<Instituicao & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nome: '',
    dataNascimento: '',
    matricula: '',
    alergias: '',
    telefone: '',
    endereco: '',
    historico: '',
    instituicaoId: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Carrega Instituições para o Dropdown
  useEffect(() => {
    const unsubInst = onSnapshot(collection(db, 'instituicoes'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<Instituicao & { id: string }>;
      setInstituicoes(data);
    });
    return () => unsubInst();
  }, []);

  // Carrega Pacientes em Tempo Real
  useEffect(() => {
    const q = query(collection(db, 'pacientes'), orderBy('nome', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<Paciente & { id: string }>;
        setPacientes(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar pacientes:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Formata data para salvar (opcional, mas bom para manter padrão YYYY-MM-DD no banco se preferir, ou manter DD/MM/AAAA)
      const dataToSave = {
        ...form,
        nome: form.nome.toUpperCase(),
        // Mantemos a data como string no formato que o usuário digitou ou convertemos. 
        // Aqui vamos salvar como string simples para facilitar.
      };

      if (editingId) {
        await updateDoc(doc(db, 'pacientes', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'pacientes'), dataToSave);
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('ERRO AO SALVAR PACIENTE');
    }
  };

  const handleEdit = (pac: Paciente & { id: string }) => {
    setForm({
      nome: pac.nome || '',
      // Se a data estiver em formato Date ou Timestamp, precisamos converter para input date (YYYY-MM-DD)
      dataNascimento: pac.dataNascimento ? pac.dataNascimento.split('/').reverse().join('-') : '',
      matricula: pac.matricula || '',
      alergias: pac.alergias || '',
      telefone: pac.telefone || '',
      endereco: pac.endereco || '',
      historico: pac.historico || '',
      instituicaoId: pac.instituicaoId || ''
    });
    setEditingId(pac.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('CONFIRMA EXCLUSÃO DESTE PACIENTE?')) {
      try {
        await deleteDoc(doc(db, 'pacientes', id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('ERRO AO EXCLUIR PACIENTE');
      }
    }
  };

  const resetForm = () => {
    setForm({
      nome: '',
      dataNascimento: '',
      matricula: '',
      alergias: '',
      telefone: '',
      endereco: '',
      historico: '',
      instituicaoId: ''
    });
    setEditingId(null);
  };

  // Função auxiliar para converter data do input (YYYY-MM-DD) para exibição (DD/MM/AAAA)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Se já for DD/MM/AAAA
    if (dateStr.includes('/')) return dateStr;
    // Se for YYYY-MM-DD (do input date)
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO PACIENTES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-teal-700" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
            CADASTRO DE PACIENTES
          </h1>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">NOME COMPLETO *</label>
                <input
                  required
                  placeholder="EX: MARIA DA SILVA"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">PRONTUÁRIO / MATRÍCULA *</label>
                <input
                  required
                  placeholder="EX: 123456"
                  value={form.matricula}
                  onChange={e => setForm({ ...form, matricula: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">DATA DE NASCIMENTO *</label>
                <input
                  type="date"
                  required
                  value={form.dataNascimento}
                  onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">TELEFONE</label>
                <input
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">INSTITUIÇÃO VINCULADA</label>
              <select
                value={form.instituicaoId}
                onChange={e => setForm({ ...form, instituicaoId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
              >
                <option value="">SELECIONE UMA INSTITUIÇÃO (OPCIONAL)</option>
                {instituicoes.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ENDEREÇO</label>
              <input
                placeholder="RUA, NÚMERO, BAIRRO, CIDADE"
                value={form.endereco}
                onChange={e => setForm({ ...form, endereco: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ALERGIAS</label>
              <input
                placeholder="EX: DIPIRONA, AMENDOIM (DEIXE VAZIO SE NÃO HOUVER)"
                value={form.alergias}
                onChange={e => setForm({ ...form, alergias: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">HISTÓRICO CLÍNICO / OBSERVAÇÕES</label>
              <textarea
                rows={3}
                placeholder="INFORMAÇÕES RELEVANTES SOBRE O PACIENTE"
                value={form.historico}
                onChange={e => setForm({ ...form, historico: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
              />
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors shadow-lg"
              >
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'ATUALIZAR PACIENTE' : 'CADASTRAR PACIENTE'}
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

        {/* LISTA DE PACIENTES */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {pacientes.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold uppercase">
                NENHUM PACIENTE CADASTRADO
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pacientes.map((p) => {
                const inst = instituicoes.find(i => i.id === p.instituicaoId);
                return (
                  <div key={p.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-teal-700" />
                        <p className="font-bold text-gray-900 text-lg uppercase">{p.nome}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 uppercase">
                        <p><span className="font-semibold">PRONTUÁRIO:</span> {p.matricula}</p>
                        <p><span className="font-semibold">NASCIMENTO:</span> {formatDisplayDate(p.dataNascimento)}</p>
                        {p.telefone && <p><span className="font-semibold">TEL:</span> {p.telefone}</p>}
                        {inst && <p><span className="font-semibold">INST:</span> {inst.nome}</p>}
                      </div>
                      
                      {p.alergias && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold uppercase">
                            <AlertCircle className="w-3 h-3" /> ALERGIAS: {p.alergias}
                          </span>
                        </div>
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
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
