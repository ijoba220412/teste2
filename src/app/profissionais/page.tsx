'use client';
import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Professional } from '@/types';
import { Plus, Trash2, Stethoscope, Edit } from 'lucide-react';

export default function ProfissionaisPage() {
  const [list, setList] = useState<Professional[]>([]);
  const [form, setForm] = useState({
    nome: '',
    cargo: '',
    cargoOutro: '',
    email: '',
    especialidade: '',
    numeroRegistro: '',
    orgao: '',
    uf: '',
    local: '',
    observacoes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const snap = await getDocs(collection(db, 'professionals'));
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Professional)));
  };

  useEffect(() => { 
    load(); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateDoc(doc(db, 'professionals', editingId), form);
    } else {
      await addDoc(collection(db, 'professionals'), form);
    }
    
    setForm({
      nome: '',
      cargo: '',
      cargoOutro: '',
      email: '',
      especialidade: '',
      numeroRegistro: '',
      orgao: '',
      uf: '',
      local: '',
      observacoes: '',
    });
    setEditingId(null);
    load();
  };

  const handleEdit = (prof: Professional) => {
    setForm({
      nome: prof.nome || '',
      cargo: prof.cargo || '',
      cargoOutro: prof.cargoOutro || '',
      email: prof.email || '',
      especialidade: prof.especialidade || '',
      numeroRegistro: prof.numeroRegistro || '',
      orgao: prof.orgao || '',
      uf: prof.uf || '',
      local: prof.local || '',
      observacoes: prof.observacoes || '',
    });
    setEditingId(prof.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este profissional?')) {
      await deleteDoc(doc(db, 'professionals', id));
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Stethoscope className="h-8 w-8 text-primary" /> Profissionais
      </h2>
      
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input 
            required 
            placeholder="Nome completo" 
            value={form.nome} 
            onChange={e => setForm({ ...form, nome: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Cargo" 
            value={form.cargo} 
            onChange={e => setForm({ ...form, cargo: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Especialidade" 
            value={form.especialidade} 
            onChange={e => setForm({ ...form, especialidade: e.target.value })}
            className="input-field" 
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Número de Registro" 
            value={form.numeroRegistro} 
            onChange={e => setForm({ ...form, numeroRegistro: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Órgão (ex: CRF, CRM)" 
            value={form.orgao} 
            onChange={e => setForm({ ...form, orgao: e.target.value })}
            className="input-field" 
          />
        </div>
        
        <textarea 
          placeholder="Observações" 
          value={form.observacoes} 
          onChange={e => setForm({ ...form, observacoes: e.target.value })}
          className="input-field"
          rows={2}
        />
        
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
                  cargo: '',
                  cargoOutro: '',
                  email: '',
                  especialidade: '',
                  numeroRegistro: '',
                  orgao: '',
                  uf: '',
                  local: '',
                  observacoes: '',
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
        {list.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-slate-50">
            <div>
              <p className="font-bold text-lg">{p.nome}</p>
              <p className="text-sm text-slate-500">
                {p.cargo} {p.especialidade && `• ${p.especialidade}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(p)} 
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleDelete(p.id)} 
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
