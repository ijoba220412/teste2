'use client';
import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Medication } from '@/types';
import { SYMPTOMS_DATA } from '@/lib/symptoms';
import { Plus, Trash2, Pill, Edit } from 'lucide-react';

export default function MedicamentosPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [form, setForm] = useState({ 
    nome: '', 
    dosagem: '', 
    apresentacao: 'comprimido' as const,
    indicacao: '',
    symptomIds: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const snap = await getDocs(collection(db, 'medications'));
    setMeds(snap.docs.map(d => ({ id: d.id, ...d.data() } as Medication)));
  };

  useEffect(() => { 
    load(); 
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
    
    if (editingId) {
      await updateDoc(doc(db, 'medications', editingId), form);
    } else {
      await addDoc(collection(db, 'medications'), form);
    }
    
    setForm({ 
      nome: '', 
      dosagem: '', 
      apresentacao: 'comprimido',
      indicacao: '',
      symptomIds: []
    });
    setEditingId(null);
    load();
  };

  const handleEdit = (med: Medication) => {
    setForm({
      nome: med.nome || '',
      dosagem: med.dosagem || '',
      apresentacao: med.apresentacao || 'comprimido',
      indicacao: med.indicacao || '',
      symptomIds: med.symptomIds || [],
    });
    setEditingId(med.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este medicamento?')) {
      await deleteDoc(doc(db, 'medications', id));
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
        <Pill className="h-8 w-8 text-primary" /> Cadastro de Medicamentos
      </h2>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            required 
            placeholder="Nome" 
            value={form.nome} 
            onChange={e => setForm({ ...form, nome: e.target.value })}
            className="input-field" 
          />
          <input 
            required 
            placeholder="Dosagem (ex: 500mg)" 
            value={form.dosagem} 
            onChange={e => setForm({ ...form, dosagem: e.target.value })}
            className="input-field" 
          />
          <select 
            value={form.apresentacao} 
            onChange={e => setForm({ ...form, apresentacao: e.target.value as any })}
            className="input-field"
          >
            <option value="comprimido">Comprimido</option>
            <option value="capsula">Cápsula</option>
            <option value="gota">Gota</option>
            <option value="liquido">Líquido (copo medidor)</option>
            <option value="xarope">Xarope</option>
            <option value="spray">Spray</option>
            <option value="pomada">Pomada</option>
          </select>
          <input 
            placeholder="Para que serve" 
            value={form.indicacao} 
            onChange={e => setForm({ ...form, indicacao: e.target.value })}
            className="input-field" 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Sintomas que este medicamento trata:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SYMPTOMS_DATA.map(symptom => (
              <button
                key={symptom.id}
                type="button"
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  form.symptomIds.includes(symptom.id)
                    ? 'border-primary bg-teal-50 shadow-md'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <img 
                  src={`/img/n/f/${symptom.file}`} 
                  alt={symptom.name}
                  className="w-12 h-12 object-contain"
                />
                <span className="text-xs font-semibold text-center">{symptom.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? 'Atualizar' : 'Cadastrar'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => {
                setEditingId(null);
                setForm({ 
                  nome: '', 
                  dosagem: '', 
                  apresentacao: 'comprimido',
                  indicacao: '',
                  symptomIds: []
                });
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        {meds.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-slate-50">
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-lg">{m.nome} - {m.dosagem}</p>
              <p className="text-sm text-slate-500 capitalize">{m.apresentacao} {m.indicacao && `• ${m.indicacao}`}</p>
              {m.symptomIds && m.symptomIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.symptomIds.map(sid => {
                    const sym = SYMPTOMS_DATA.find(s => s.id === sid);
                    return sym ? (
                      <span key={sid} className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                        {sym.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(m)} 
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleDelete(m.id)} 
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
