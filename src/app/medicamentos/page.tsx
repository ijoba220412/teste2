'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Medicamento } from '@/types';
import { SYMPTOMS_DATA } from '@/lib/symptoms';
import { Plus, Trash2, Pill, Edit, Activity } from 'lucide-react';

// Tipo auxiliar para o array de sintomas
interface SymptomType {
  id: string;
  name: string;
  file: string;
}

export default function MedicamentosPage() {
  const [meds, setMeds] = useState<Array<Medicamento & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nomeComercial: '',
    principioAtivo: '',
    apresentacao: 'comprimido',
    fabricante: '',
    dosagem: '',
    indicacao: '',
    symptomIds: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'medicamentos_padrao'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<Medicamento & { id: string }>;
        setMeds(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar medicamentos:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const toggleSymptom = (symptomId: string) => {
    setForm(prev => ({
      ...prev,
      symptomIds: prev.symptomIds.includes(symptomId)
        ? prev.symptomIds.filter(id => id !== symptomId)
        : [...prev.symptomIds, symptomId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDoc(doc(db, 'medicamentos_padrao', editingId), form);
      } else {
        await addDoc(collection(db, 'medicamentos_padrao'), form);
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      alert('ERRO AO SALVAR MEDICAMENTO');
    }
  };

  const handleEdit = (med: Medicamento & { id: string }) => {
    setForm({
      nomeComercial: (med.nomeComercial || med.nome || '').toUpperCase(),
      principioAtivo: (med.principioAtivo || '').toUpperCase(),
      apresentacao: med.apresentacao || 'comprimido',
      fabricante: (med.fabricante || '').toUpperCase(),
      dosagem: (med.dosagem || '').toUpperCase(),
      indicacao: (med.indicacao || '').toUpperCase(),
      symptomIds: (med.symptomIds as string[]) || [],
    });
    setEditingId(med.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('CONFIRMA EXCLUSÃO DESTE MEDICAMENTO?')) {
      try {
        await deleteDoc(doc(db, 'medicamentos_padrao', id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('ERRO AO EXCLUIR MEDICAMENTO');
      }
    }
  };

  const resetForm = () => {
    setForm({
      nomeComercial: '',
      principioAtivo: '',
      apresentacao: 'comprimido',
      fabricante: '',
      dosagem: '',
      indicacao: '',
      symptomIds: []
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO MEDICAMENTOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Pill className="w-8 h-8 text-teal-700" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
            CADASTRO DE MEDICAMENTOS
          </h1>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">NOME COMERCIAL *</label>
                <input
                  required
                  placeholder="EX: DIPIRONA"
                  value={form.nomeComercial}
                  onChange={e => setForm({ ...form, nomeComercial: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">PRINCÍPIO ATIVO</label>
                <input
                  placeholder="EX: METAMIZOL SÓDICO"
                  value={form.principioAtivo}
                  onChange={e => setForm({ ...form, principioAtivo: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">APRESENTAÇÃO *</label>
                <select
                  value={form.apresentacao}
                  onChange={e => setForm({ ...form, apresentacao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                >
                  <option value="comprimido">COMPRIMIDO</option>
                  <option value="capsula">CÁPSULA</option>
                  <option value="gota">GOTA</option>
                  <option value="liquido">LÍQUIDO (COPO MEDIDOR)</option>
                  <option value="xarope">XAROPE</option>
                  <option value="spray">SPRAY</option>
                  <option value="pomada">POMADA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">FABRICANTE</label>
                <input
                  placeholder="EX: NEO QUÍMICA"
                  value={form.fabricante}
                  onChange={e => setForm({ ...form, fabricante: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">DOSAGEM (EX: 500MG)</label>
                <input
                  placeholder="EX: 500MG"
                  value={form.dosagem}
                  onChange={e => setForm({ ...form, dosagem: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">PARA QUE SERVE (INDICAÇÃO)</label>
                <input
                  placeholder="EX: ANALGÉSICO E ANTITÉRMICO"
                  value={form.indicacao}
                  onChange={e => setForm({ ...form, indicacao: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4 uppercase">
                SINTOMAS QUE ESTE MEDICAMENTO TRATA:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {SYMPTOMS_DATA.map((symptom: SymptomType) => (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      form.symptomIds.includes(symptom.id)
                        ? 'border-teal-600 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-teal-300 bg-white'
                    }`}
                  >
                    <img
                      src={`/img/n/f/${symptom.file}`}
                      alt={symptom.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-semibold text-center uppercase">{symptom.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors shadow-lg"
              >
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'ATUALIZAR MEDICAMENTO' : 'CADASTRAR MEDICAMENTO'}
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

        {/* LISTA DE MEDICAMENTOS */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {meds.length === 0 ? (
            <div className="text-center py-16">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold uppercase">
                NENHUM MEDICAMENTO CADASTRADO
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meds.map((m: Medicamento & { id: string }) => (
                <div key={m.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Pill className="w-5 h-5 text-teal-700" />
                      <p className="font-bold text-gray-900 text-lg uppercase">
                        {m.nomeComercial || m.nome} {m.dosagem && `- ${m.dosagem}`}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 uppercase">
                      <span className="font-semibold">{m.apresentacao}</span>
                      {m.principioAtivo && (
                        <>
                          <span>•</span>
                          <span>{m.principioAtivo}</span>
                        </>
                      )}
                      {m.fabricante && (
                        <>
                          <span>•</span>
                          <span>{m.fabricante}</span>
                        </>
                      )}
                    </div>
                    
                    {m.indicacao && (
                      <p className="text-sm text-gray-500 mt-2 uppercase">
                        {m.indicacao}
                      </p>
                    )}
                    
                    {/* CORREÇÃO DO ERRO DE TIPO AQUI ABAIXO */}
                    {m.symptomIds && (m.symptomIds as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(m.symptomIds as string[]).map((sid: string) => {
                          const sym = SYMPTOMS_DATA.find((s: SymptomType) => s.id === sid);
                          return sym ? (
                            <span
                              key={sid}
                              className="text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold uppercase"
                            >
                              {sym.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="EDITAR"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id || '')}
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
