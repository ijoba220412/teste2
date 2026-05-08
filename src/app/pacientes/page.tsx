'use client';
import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Paciente, Instituicao } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/utils/formatDate';
import { Plus, Search, User, Clipboard, Edit2, X } from 'lucide-react';
import { mascaraData, mascaraTelefone } from '@/utils/masks';
import Link from 'next/link';

export default function PacientesPage() {
  const { data: pacientes, list, add, update } = useFirestore<Paciente>('pacientes');
  const { data: instituicoes, list: listInst } = useFirestore<Instituicao>('instituicoes');
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newPac, setNewPac] = useState<Partial<Paciente>>({
    nome: '', 
    nascimento: '', 
    prontuario: '', 
    alergiasDescricao: '', 
    contato: '', 
    instituicaoId: '',
    temAlergia: false
  });

  useEffect(() => {
    const unsubPac = list();
    const unsubInst = listInst();
    return () => { unsubPac(); unsubInst(); };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...newPac,
      alergiasDescricao: newPac.temAlergia ? newPac.alergiasDescricao : ''
    };

    if (isEditing && newPac.id) {
      await update(newPac.id, dataToSave as Paciente);
    } else {
      await add(dataToSave as Paciente);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewPac({ 
      nome: '', 
      nascimento: '', 
      prontuario: '', 
      alergiasDescricao: '', 
      contato: '', 
      instituicaoId: '',
      temAlergia: false 
    });
  };

  const handleEdit = (paciente: Paciente) => {
    setNewPac(paciente);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredPacientes = pacientes.filter(p => {
    const nomeMatch = p.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const prontuarioMatch = p.prontuario?.includes(searchTerm);
    return nomeMatch || prontuarioMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black text-teal-900 uppercase">
          {isEditing ? 'Editando Paciente' : 'Pacientes'}
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl w-full focus:border-teal-500 outline-none uppercase font-bold text-sm"
              placeholder="BUSCAR NOME OU PRONTUÁRIO..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={isEditing ? resetForm : () => setShowForm(!showForm)} variant={isEditing ? 'secondary' : 'default'}>
            {showForm || isEditing ? <X size={20} /> : <Plus size={20} />} 
            {isEditing ? 'CANCELAR EDIÇÃO' : (showForm ? 'FECHAR' : 'NOVO')}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-2 border-teal-500 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input label="NOME COMPLETO DO PACIENTE" value={newPac.nome} onChange={e => setNewPac({...newPac, nome: e.target.value.toUpperCase()})} required />
            </div>
            
            <Input 
              label="DATA DE NASCIMENTO" 
              value={newPac.nascimento} 
              onChange={e => setNewPac({...newPac, nascimento: mascaraData(e.target.value)})} 
              maxLength={10}
              placeholder="DD/MM/AAAA"
            />
            
            <Input label="MATRÍCULA / PRONTUÁRIO" value={newPac.prontuario} onChange={e => setNewPac({...newPac, prontuario: e.target.value.toUpperCase()})} required />
            
            <Input 
              label="CONTATO (TELEFONE)" 
              value={newPac.contato} 
              onChange={e => setNewPac({...newPac, contato: mascaraTelefone(e.target.value)})} 
              maxLength={15}
            />
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 uppercase">INSTITUIÇÃO PADRÃO</label>
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 outline-none uppercase font-semibold"
                value={newPac.instituicaoId}
                onChange={e => setNewPac({...newPac, instituicaoId: e.target.value})}
              >
                <option value="">SELECIONE UMA INSTITUIÇÃO</option>
                {instituicoes.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-teal-600 rounded"
                  checked={newPac.temAlergia}
                  onChange={e => setNewPac({...newPac, temAlergia: e.target.checked})}
                />
                <span className="text-sm font-black text-teal-900 uppercase">O paciente possui alergias ou observações críticas?</span>
              </label>

              {newPac.temAlergia && (
                <div className="mt-4 animate-in zoom-in-95">
                  <Input 
                    label="DESCREVA AS ALERGIAS" 
                    value={newPac.alergiasDescricao} 
                    onChange={e => setNewPac({...newPac, alergiasDescricao: e.target.value.toUpperCase()})} 
                    isTextArea 
                    required
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <Button type="submit" fullWidth>
                {isEditing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PACIENTE'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredPacientes.map((pac) => (
          <Card key={pac.id} className="hover:shadow-xl transition-all group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-teal-100 transition-colors">
                  <User className="text-slate-400 group-hover:text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-teal-900 text-lg uppercase leading-tight">{pac.nome}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase">
                      <Clipboard size={14} /> PRONTUÁRIO: {pac.prontuario}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      NASC: {pac.nascimento}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {pac.temAlergia && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    ALÉRGICO
                  </span>
                )}
                <Button onClick={() => handleEdit(pac)} variant="secondary" className="flex-1 md:flex-none py-2 px-4 text-xs flex gap-2">
                  <Edit2 size={14} /> EDITAR
                </Button>
                
                {/* Botão Nova Receita agora redireciona com o ID do paciente */}
                <Link href={`/receitas/nova?pacienteId=${pac.id}`} className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full py-2 px-4 text-xs">
                    NOVA RECEITA
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}