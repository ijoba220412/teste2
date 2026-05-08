'use client';
import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Medicamento } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Info, Edit2, X } from 'lucide-react';
import { MedIcon } from '@/components/ui/MedIcon';

export default function MedicamentosPage() {
  const { data: medicamentos, loading, list, add, update } = useFirestore<Medicamento>('medicamentos_padrao');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newMed, setNewMed] = useState<Partial<Medicamento>>({
    nome: '', apresentacao: 'comprimido', indicacao: ''
  });

  const opcoesApresentacao = ['capsula', 'comprimido', 'gotas', 'liquido', 'OUTROS'];

  useEffect(() => {
    const unsubscribe = list();
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && newMed.id) {
      await update(newMed.id, newMed as Medicamento);
    } else {
      await add(newMed as Medicamento);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewMed({ nome: '', apresentacao: 'comprimido', indicacao: '' });
  };

  const handleEdit = (med: Medicamento) => {
    setNewMed(med);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-teal-900 uppercase">
          {isEditing ? 'Editando Medicamento' : 'Medicamentos Padrão'}
        </h1>
        <Button onClick={isEditing ? resetForm : () => setShowForm(!showForm)} variant={isEditing ? 'secondary' : 'default'}>
          {showForm || isEditing ? <X size={20} /> : <Plus size={20} />} 
          {isEditing ? 'CANCELAR EDIÇÃO' : (showForm ? 'CANCELAR' : 'CADASTRAR MEDICAMENTO')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-teal-500 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="NOME DO MEDICAMENTO" value={newMed.nome} onChange={e => setNewMed({...newMed, nome: e.target.value.toUpperCase()})} required />
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 uppercase">Apresentação</label>
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 outline-none uppercase font-semibold"
                value={newMed.apresentacao}
                onChange={e => setNewMed({...newMed, apresentacao: e.target.value.toLowerCase()})}
              >
                {opcoesApresentacao.map(op => (
                  <option key={op} value={op}>{op.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Input label="INDICAÇÃO" value={newMed.indicacao} onChange={e => setNewMed({...newMed, indicacao: e.target.value.toUpperCase()})} />
            </div>
            
            <div className="md:col-span-2 mt-2">
              <Button type="submit" fullWidth>
                {isEditing ? 'SALVAR ALTERAÇÕES' : 'SALVAR MEDICAMENTO'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {medicamentos.map((med) => (
          <Card key={med.id} className="border-l-8 border-teal-600 relative group">
            <button 
              onClick={() => handleEdit(med)}
              className="absolute top-2 right-2 p-2 bg-slate-100 text-slate-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-600 hover:text-white"
            >
              <Edit2 size={14} />
            </button>
            <div className="flex items-start gap-4">
              <div className="bg-teal-50 p-3 rounded-xl">
                <MedIcon apresentacao={med.apresentacao || ''} size={24} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-teal-900 uppercase leading-none mb-2">{med.nome || "SEM NOME"}</h3>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-teal-700 bg-teal-100 w-fit px-2 py-0.5 rounded uppercase">
                    {med.apresentacao || "NÃO DEFINIDA"}
                  </p>
                  {med.indicacao && (
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase leading-tight">
                      <Info size={12} className="text-teal-500 shrink-0" /> 
                      {med.indicacao}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}