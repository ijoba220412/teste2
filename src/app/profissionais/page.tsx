'use client';
import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Profissional } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, UserCheck, Award, Edit2, X, Users } from 'lucide-react';
import { mascaraRegistro } from '@/utils/masks';

export default function ProfissionaisPage() {
  const { data: profissionais, loading, list, addWithId, update } = useFirestore<Profissional>('profissionais');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newProf, setNewProf] = useState<Partial<Profissional>>({
    id: '', nome: '', cargo: 'Médico(a)', numeroRegistro: '', orgao: 'CRM', uf: 'RJ'
  });

  useEffect(() => {
    const unsubscribe = list();
    return () => unsubscribe();
  }, []);

  const handleCargoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cargoSelecionado = e.target.value;
    let orgaoAutomatico = "OUTRO";
    if (cargoSelecionado === "Farmacêutico(a)") orgaoAutomatico = "CRF";
    else if (cargoSelecionado === "Médico(a)") orgaoAutomatico = "CRM";
    setNewProf({ ...newProf, cargo: cargoSelecionado as any, orgao: orgaoAutomatico as any });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProf.id) return alert("ID MANUAL OBRIGATÓRIO (EX: ANA_LIMA)");
    
    const { id, ...data } = newProf;
    if (isEditing) {
      await update(id.toUpperCase(), data as Profissional);
    } else {
      await addWithId(id.toUpperCase(), data as Profissional);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewProf({ id: '', nome: '', cargo: 'Médico(a)', numeroRegistro: '', orgao: 'CRM', uf: 'RJ' });
  };

  const startEdit = (prof: Profissional) => {
    setNewProf(prof);
    setIsEditing(true);
    setShowForm(true);
  };

  const medicos = profissionais.filter(p => p.cargo === 'Médico(a)');
  const farmaceuticos = profissionais.filter(p => p.cargo === 'Farmacêutico(a)');
  const outros = profissionais.filter(p => p.cargo !== 'Médico(a)' && p.cargo !== 'Farmacêutico(a)');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-teal-900 uppercase">Profissionais</h1>
        <Button onClick={isEditing ? resetForm : () => setShowForm(!showForm)}>
          {showForm ? <X size={20} /> : <Plus size={20} />} 
          {isEditing ? 'CANCELAR EDIÇÃO' : (showForm ? 'CANCELAR' : 'NOVO PROFISSIONAL')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-teal-500 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="ID MANUAL (EX: RICARDO_DE_RODRIGUES)" 
              value={newProf.id} 
              onChange={e => setNewProf({...newProf, id: e.target.value.replace(/\s/g, '_').toUpperCase()})} 
              required 
              disabled={isEditing}
            />
            <Input label="NOME COMPLETO" value={newProf.nome} onChange={e => setNewProf({...newProf, nome: e.target.value.toUpperCase()})} required />
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 uppercase">CARGO</label>
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 outline-none uppercase font-semibold"
                value={newProf.cargo}
                onChange={handleCargoChange}
              >
                <option value="Médico(a)">MÉDICO(A)</option>
                <option value="Farmacêutico(a)">FARMACÊUTICO(A)</option>
                <option value="Outro">OUTRO</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1"><Input label="ÓRGÃO" value={newProf.orgao} onChange={e => setNewProf({...newProf, orgao: e.target.value.toUpperCase() as any})} /></div>
              <div className="col-span-1"><Input label="REGISTRO" value={newProf.numeroRegistro} onChange={e => setNewProf({...newProf, numeroRegistro: mascaraRegistro(e.target.value)})} /></div>
              <div className="col-span-1"><Input label="UF" value={newProf.uf} onChange={e => setNewProf({...newProf, uf: e.target.value.toUpperCase()})} maxLength={2} /></div>
            </div>
            
            <div className="md:col-span-2">
              <Button type="submit" fullWidth>{isEditing ? 'SALVAR ALTERAÇÕES' : 'SALVAR PROFISSIONAL'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* SEÇÃO MÉDICOS */}
      {medicos.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-teal-700 uppercase flex items-center gap-2"><UserCheck size={20}/> Médicos(as)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {medicos.map(prof => <ProfissionalCard key={prof.id} prof={prof} onEdit={startEdit} />)}
          </div>
        </section>
      )}

      {/* SEÇÃO FARMACÊUTICOS */}
      {farmaceuticos.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-cyan-700 uppercase flex items-center gap-2"><Award size={20}/> Farmacêuticos(as)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {farmaceuticos.map(prof => <ProfissionalCard key={prof.id} prof={prof} onEdit={startEdit} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ProfissionalCard({ prof, onEdit }: { prof: Profissional, onEdit: (p: Profissional) => void }) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 flex">
        <button onClick={() => onEdit(prof)} className="p-2 bg-teal-100 text-teal-700 hover:bg-teal-700 hover:text-white transition-colors">
          <Edit2 size={14} />
        </button>
        <div className="p-2 bg-teal-700 text-white text-[10px] font-black uppercase">ID: {prof.id}</div>
      </div>
      <div className="flex flex-col items-center text-center pt-4">
        <div className="bg-slate-100 p-4 rounded-full mb-3 group-hover:bg-teal-50 transition-colors">
          <UserCheck className="text-slate-500 group-hover:text-teal-600" size={32} />
        </div>
        <h3 className="font-black text-teal-900 leading-tight mb-1">{prof.nome}</h3>
        <p className="text-xs font-bold text-teal-600 mb-3">{prof.cargo}</p>
        <div className="flex items-center gap-2 text-xs font-black bg-slate-100 px-3 py-1 rounded-full text-slate-600">
          <Award size={14} /> {prof.numeroRegistro ? `${prof.orgao}: ${prof.numeroRegistro} / ${prof.uf}` : "REGISTRO NÃO INFORMADO"}
        </div>
      </div>
    </Card>
  );
}