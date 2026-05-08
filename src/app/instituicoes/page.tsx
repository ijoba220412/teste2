'use client';
import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Instituicao } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Plus, MapPin, Phone, Edit2, X } from 'lucide-react';
import { mascaraCEP, mascaraTelefone } from '@/utils/masks';

export default function InstituicoesPage() {
  const { data: instituicoes, loading, list, add, update } = useFirestore<Instituicao>('instituicoes');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newInst, setNewInst] = useState<Partial<Instituicao>>({
    nome: '', descricao: '', rua: '', numero: '', bairro: '', cidade: '', uf: 'RJ', cep: '', telefone1: '', tipo: 'HOSPITAL', pais: 'BRASIL'
  });

  useEffect(() => {
    const unsubscribe = list();
    return () => unsubscribe();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepFormatado = mascaraCEP(e.target.value);
    setNewInst(prev => ({ ...prev, cep: cepFormatado }));
    const cepLimpo = cepFormatado.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setNewInst(prev => ({
            ...prev,
            rua: (data.logradouro || '').toUpperCase(),
            bairro: (data.bairro || '').toUpperCase(),
            cidade: (data.localidade || '').toUpperCase(),
            uf: (data.uf || '').toUpperCase(),
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && newInst.id) {
      await update(newInst.id, newInst as Instituicao);
    } else {
      await add(newInst as Instituicao);
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewInst({ nome: '', descricao: '', rua: '', numero: '', bairro: '', cidade: '', uf: 'RJ', cep: '', telefone1: '', tipo: 'HOSPITAL', pais: 'BRASIL' });
  };

  const handleEdit = (inst: Instituicao) => {
    setNewInst(inst);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="p-10 font-black text-teal-800 uppercase animate-pulse">CARREGANDO INSTITUIÇÕES...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-teal-900 uppercase">
          {isEditing ? 'Editando Instituição' : 'Instituições'}
        </h1>
        <Button onClick={isEditing ? resetForm : () => setShowForm(!showForm)} variant={isEditing ? 'secondary' : 'default'}>
          {showForm || isEditing ? <X size={20} /> : <Plus size={20} />} 
          {isEditing ? 'CANCELAR EDIÇÃO' : (showForm ? 'CANCELAR' : 'NOVA INSTITUIÇÃO')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-teal-500 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input label="NOME DA INSTITUIÇÃO" value={newInst.nome} onChange={e => setNewInst({...newInst, nome: e.target.value.toUpperCase()})} required />
            </div>
            <Input label="TIPO" value={newInst.tipo} onChange={e => setNewInst({...newInst, tipo: e.target.value.toUpperCase()})} />
            <div className="md:col-span-3">
              <Input label="DESCRIÇÃO COMPLETA" value={newInst.descricao} onChange={e => setNewInst({...newInst, descricao: e.target.value.toUpperCase()})} isTextArea />
            </div>
            <Input label="CEP" value={newInst.cep} onChange={handleCepChange} maxLength={9} />
            <div className="md:col-span-2">
              <Input label="RUA" value={newInst.rua} onChange={e => setNewInst({...newInst, rua: e.target.value.toUpperCase()})} />
            </div>
            <Input label="NÚMERO" value={newInst.numero} onChange={e => setNewInst({...newInst, numero: e.target.value.toUpperCase()})} />
            <Input label="BAIRRO" value={newInst.bairro} onChange={e => setNewInst({...newInst, bairro: e.target.value.toUpperCase()})} />
            <Input label="CIDADE" value={newInst.cidade} onChange={e => setNewInst({...newInst, cidade: e.target.value.toUpperCase()})} />
            <Input label="UF" value={newInst.uf} onChange={e => setNewInst({...newInst, uf: e.target.value.toUpperCase()})} maxLength={2} />
            <div className="md:col-span-2">
              <Input label="TELEFONE PRINCIPAL" value={newInst.telefone1} onChange={e => setNewInst({...newInst, telefone1: mascaraTelefone(e.target.value)})} maxLength={15} />
            </div>
            <div className="md:col-span-3 mt-2">
              <Button type="submit" fullWidth>
                {isEditing ? 'SALVAR ALTERAÇÕES' : 'SALVAR INSTITUIÇÃO'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {instituicoes.map((inst) => (
          <Card key={inst.id} className="hover:border-teal-300 transition-colors relative group">
            <button 
              onClick={() => handleEdit(inst)}
              className="absolute top-2 right-2 p-2 bg-slate-100 text-slate-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-600 hover:text-white"
            >
              <Edit2 size={14} />
            </button>
            <div className="flex gap-4">
              <div className="bg-teal-100 p-4 rounded-xl h-fit">
                <Building2 className="text-teal-700" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-teal-900 leading-tight">{inst.nome || "INSTITUIÇÃO SEM NOME"}</h3>
                <p className="text-xs font-bold text-slate-500 mb-4 mt-1">{inst.descricao || "Sem descrição"}</p>
                <div className="space-y-1 text-xs font-bold text-slate-600 uppercase">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="shrink-0 mt-0.5 text-teal-600" /> 
                    <span>{inst.rua ? `${inst.rua}, ${inst.numero || 'S/N'}` : 'ENDEREÇO NÃO INFORMADO'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone size={14} className="text-teal-600" /> 
                    {inst.telefone1 || 'TELEFONE NÃO CADASTRADO'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}