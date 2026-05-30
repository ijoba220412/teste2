'use client';
import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Institution } from '@/types';
import { Plus, Trash2, Building2, Edit } from 'lucide-react';

export default function InstituicoesPage() {
  const [list, setList] = useState<Institution[]>([]);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      pais: 'Brasil',
    },
    telefone1: '',
    telefone2: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const snap = await getDocs(collection(db, 'institutions'));
    setList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Institution)));
  };

  useEffect(() => { 
    load(); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateDoc(doc(db, 'institutions', editingId), form);
    } else {
      await addDoc(collection(db, 'institutions'), form);
    }
    
    setForm({
      nome: '',
      descricao: '',
      tipo: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        pais: 'Brasil',
      },
      telefone1: '',
      telefone2: '',
    });
    setEditingId(null);
    load();
  };

  const handleEdit = (inst: Institution) => {
    setForm({
      nome: inst.nome || '',
      descricao: inst.descricao || '',
      tipo: inst.tipo || '',
      endereco: inst.endereco || {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        pais: 'Brasil',
      },
      telefone1: inst.telefone1 || '',
      telefone2: inst.telefone2 || '',
    });
    setEditingId(inst.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta instituição?')) {
      await deleteDoc(doc(db, 'institutions', id));
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" /> Instituições
      </h2>
      
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input 
            required 
            placeholder="Nome da Instituição" 
            value={form.nome} 
            onChange={e => setForm({ ...form, nome: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Tipo (ex: Hospital, Clínica)" 
            value={form.tipo} 
            onChange={e => setForm({ ...form, tipo: e.target.value })}
            className="input-field" 
          />
          <input 
            placeholder="Telefone 1" 
            value={form.telefone1} 
            onChange={e => setForm({ ...form, telefone1: e.target.value })}
            className="input-field" 
          />
        </div>
        
        <textarea 
          placeholder="Descrição" 
          value={form.descricao} 
          onChange={e => setForm({ ...form, descricao: e.target.value })}
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
                  descricao: '',
                  tipo: '',
                  endereco: {
                    rua: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    uf: '',
                    cep: '',
                    pais: 'Brasil',
                  },
                  telefone1: '',
                  telefone2: '',
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
        {list.map(inst => (
          <div key={inst.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-slate-50">
            <div>
              <p className="font-bold text-lg">{inst.nome}</p>
              <p className="text-sm text-slate-500">
                {inst.tipo} {inst.descricao && `• ${inst.descricao}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(inst)} 
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleDelete(inst.id)} 
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
