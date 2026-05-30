'use client';
import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/types';
import { Plus, Trash2, Users, Edit } from 'lucide-react';

export default function PacientesPage() {
  const [list, setList] = useState<Patient[]>([]);
  const [form, setForm] = useState({ 
    nome: '', 
    cpf: '', 
    dataNascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    observacoes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const snap = await getDocs(collection(db, 'patients'));
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));
  };

  useEffect(() => { 
    load(); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateDoc(doc(db, 'patients', editingId), form);
    } else {
      await addDoc(collection(db, 'patients'), form);
    }
    
    setForm({ 
      nome: '', 
      cpf: '', 
      dataNascimento: '',
      email: '',
      telefone: '',
      endereco: '',
      observacoes: ''
    });
    setEditingId(null);
    load();
  };

  const handleEdit = (patient: Patient) => {
    setForm({
      nome: patient.nome || '',
      cpf: patient.cpf || '',
      dataNascimento: patient.dataNascimento || '',
      email: patient.email || '',
      telefone: patient.telefone || '',
      endereco: patient.endereco || '',
      observacoes: patient.observacoes || '',
    });
    setEditingId(patient.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este paciente?')) {
      await deleteDoc(doc(db, 'patients', id));
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" /> Pacientes
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
            placeholder="CPF" 
            value={form.cpf} 
            onChange={e => setForm({ ...form, cpf: e.target.value })}
            className="input-field" 
          />
          <input 
            type="date" 
            value={form.dataNascimento} 
            onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
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
            placeholder="Telefone" 
            value={form.telefone} 
            onChange={e => setForm({ ...form, telefone: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Endereço" 
            value={form.endereco} 
            onChange={e => setForm({ ...form, endereco: e.target.value })}
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
                  cpf: '', 
                  dataNascimento: '',
                  email: '',
                  telefone: '',
                  endereco: '',
                  observacoes: ''
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
                {p.cpf} {p.dataNascimento && `• ${p.dataNascimento}`}
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
