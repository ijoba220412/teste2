'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IReceita, ItemPrescrito, IPaciente, IProfissional, IInstituicao, IMedicamentoPadrao } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeftIcon, SaveIcon, TrashIcon, PlusIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function EditarReceitaPage() {
  const params = useParams();
  const router = useRouter();
  const receitaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receita, setReceita] = useState<IReceita | null>(null);
  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [profissionais, setProfissionais] = useState<IProfissional[]>([]);
  const [instituicoes, setInstituicoes] = useState<IInstituicao[]>([]);
  const [medicamentos, setMedicamentos] = useState<IMedicamentoPadrao[]>([]);

  // Estado para novo item
  const [novoItem, setNovoItem] = useState<ItemPrescrito>({
    medicamentoId: '',
    medicamentoNome: '',
    apresentacao: 'COMPRIMIDO',
    dose: '',
    via: 'ORAL',
    aprazamento: '',
    indicacaoTexto: ''
  });

  useEffect(() => {
    loadData();
  }, [receitaId]);

  const loadData = async () => {
    try {
      // Carregar receita
      const receitaDoc = await getDoc(doc(db, 'receitas', receitaId));
      if (receitaDoc.exists()) {
        setReceita(receitaDoc.data() as IReceita);
      } else {
        alert('RECEITA NÃO ENCONTRADA');
        router.push('/receitas');
        return;
      }

      // Carregar listas auxiliares
      const [pacientesSnap, profissionaisSnap, instituicoesSnap, medicamentosSnap] = await Promise.all([
        getDocs(collection(db, 'pacientes')),
        getDocs(collection(db, 'profissionais')),
        getDocs(collection(db, 'instituicoes')),
        getDocs(collection(db, 'medicamentos_padrao'))
      ]);

      setPacientes(pacientesSnap.docs.map(d => ({ ...d.data(), id: d.id } as IPaciente)));
      setProfissionais(profissionaisSnap.docs.map(d => ({ ...d.data(), id: d.id } as IProfissional)));
      setInstituicoes(instituicoesSnap.docs.map(d => ({ ...d.data(), id: d.id } as IInstituicao)));
      setMedicamentos(medicamentosSnap.docs.map(d => ({ ...d.data(), id: d.id } as IMedicamentoPadrao)));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('ERRO AO CARREGAR DADOS');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!receita) return;
    
    if (receita.itensPrescritos.length === 0) {
      alert('ADICIONE PELO MENOS UM MEDICAMENTO');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'receitas', receitaId), {
        pacienteId: receita.pacienteId,
        pacienteNome: receita.pacienteNome,
        prontuario: receita.prontuario,
        profissionalId: receita.profissionalId,
        profissionalNome: receita.profissionalNome,
        instituicaoId: receita.instituicaoId || '',
        instituicaoNome: receita.instituicaoNome || '',
        itensPrescritos: receita.itensPrescritos,
        orientacoesGerais: receita.orientacoesGerais || '',
        dataUltimaEdicao: Timestamp.now()
      });
      alert('RECEITA ATUALIZADA COM SUCESSO!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('ERRO AO SALVAR RECEITA');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!novoItem.medicamentoNome || !novoItem.dose || !novoItem.aprazamento) {
      alert('PREENCHA NOME DO MEDICAMENTO, DOSE E APRAZAMENTO');
      return;
    }

    setReceita(prev => prev ? {
      ...prev,
      itensPrescritos: [...prev.itensPrescritos, { ...novoItem }]
    } : null);

    setNovoItem({
      medicamentoId: '',
      medicamentoNome: '',
      apresentacao: 'COMPRIMIDO',
      dose: '',
      via: 'ORAL',
      aprazamento: '',
      indicacaoTexto: ''
    });
  };

  const handleRemoveItem = (index: number) => {
    setReceita(prev => prev ? {
      ...prev,
      itensPrescritos: prev.itensPrescritos.filter((_, i) => i !== index)
    } : null);
  };

  const handlePrint = () => {
    window.open(`/receitas/imprimir/${receitaId}`, '_blank');
  };

  if (loading) {
    return <div className="p-8 text-center">CARREGANDO...</div>;
  }

  if (!receita) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/receitas" className="text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 uppercase">Editar Receita</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-bold uppercase text-sm"
            >
              <PrinterIcon className="w-5 h-5" /> Imprimir
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold uppercase text-sm disabled:opacity-50"
            >
              <SaveIcon className="w-5 h-5" /> {saving ? 'SALVANDO...' : 'SALVAR'}
            </button>
          </div>
        </div>

        {/* DADOS BÁSICOS */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b pb-2">Dados da Receita</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Paciente</label>
              <select
                value={receita.pacienteId}
                onChange={(e) => {
                  const paciente = pacientes.find(p => p.id === e.target.value);
                  setReceita({
                    ...receita,
                    pacienteId: e.target.value,
                    pacienteNome: paciente?.nome || '',
                    prontuario: paciente?.prontuario || ''
                  });
                }}
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECIONE</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Prontuário</label>
              <input
                type="text"
                value={receita.prontuario}
                readOnly
                className="w-full border rounded-md px-3 py-2 uppercase bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Profissional</label>
              <select
                value={receita.profissionalId}
                onChange={(e) => {
                  const prof = profissionais.find(p => p.id === e.target.value);
                  setReceita({
                    ...receita,
                    profissionalId: e.target.value,
                    profissionalNome: prof?.nome || ''
                  });
                }}
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECIONE</option>
                {profissionais.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} - {p.cargo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Instituição</label>
              <select
                value={receita.instituicaoId || ''}
                onChange={(e) => {
                  const inst = instituicoes.find(i => i.id === e.target.value);
                  setReceita({
                    ...receita,
                    instituicaoId: e.target.value,
                    instituicaoNome: inst?.nome || ''
                  });
                }}
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECIONE</option>
                {instituicoes.map(i => (
                  <option key={i.id} value={i.id}>{i.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ADICIONAR MEDICAMENTO */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b pb-2">Adicionar Medicamento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Medicamento</label>
              <select
                value={novoItem.medicamentoId}
                onChange={(e) => {
                  const med = medicamentos.find(m => m.id === e.target.value);
                  setNovoItem({
                    ...novoItem,
                    medicamentoId: e.target.value,
                    medicamentoNome: med?.nome || '',
                    apresentacao: med?.apresentacao || 'COMPRIMIDO',
                    indicacaoTexto: med?.indicacao || ''
                  });
                }}
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              >
                <option value="">SELECIONE</option>
                {medicamentos.map(m => (
                  <option key={m.id} value={m.id}>{m.nome} - {m.apresentacao}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Dose</label>
              <input
                type="text"
                value={novoItem.dose}
                onChange={(e) => setNovoItem({ ...novoItem, dose: e.target.value.toUpperCase() })}
                placeholder="EX: 500MG"
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Via</label>
              <select
                value={novoItem.via}
                onChange={(e) => setNovoItem({ ...novoItem, via: e.target.value })}
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              >
                <option value="ORAL">ORAL</option>
                <option value="SUB LINGUAL">SUBLINGUAL</option>
                <option value="RETAL">RETAL</option>
                <option value="INTRAMUSCULAR">INTRAMUSCULAR</option>
                <option value="ENDOVENOSA">ENDOVENOSA</option>
                <option value="SUBCUTANEA">SUBCUTÂNEA</option>
                <option value="TOPICO">TÓPICO</option>
                <option value="INALATORIA">INALATÓRIA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Aprazamento</label>
              <input
                type="text"
                value={novoItem.aprazamento}
                onChange={(e) => setNovoItem({ ...novoItem, aprazamento: e.target.value.toUpperCase() })}
                placeholder="EX: 8/8H OU 08H-12H-20H"
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Indicação (Pra Que Serve?)</label>
              <input
                type="text"
                value={novoItem.indicacaoTexto}
                onChange={(e) => setNovoItem({ ...novoItem, indicacaoTexto: e.target.value.toUpperCase() })}
                placeholder="EX: PARA DOR DE CABEÇA"
                className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold uppercase text-sm w-full md:w-auto"
          >
            <PlusIcon className="w-5 h-5" /> Adicionar à Receita
          </button>
        </div>

        {/* LISTA DE MEDICAMENTOS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b pb-2 mb-4">
            Medicamentos Prescritos ({receita.itensPrescritos.length})
          </h2>

          {receita.itensPrescritos.length === 0 ? (
            <p className="text-gray-500 text-center py-8 uppercase">Nenhum medicamento adicionado</p>
          ) : (
            <div className="space-y-3">
              {receita.itensPrescritos.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900 uppercase">{item.medicamentoNome}</div>
                    <div className="text-sm text-gray-600 uppercase mt-1">
                      <span className="font-semibold">DOSE:</span> {item.dose} • 
                      <span className="font-semibold ml-2">VIA:</span> {item.via} • 
                      <span className="font-semibold ml-2">APRAZAMENTO:</span> {item.aprazamento}
                    </div>
                    {item.indicacaoTexto && (
                      <div className="text-sm text-gray-700 uppercase mt-2 bg-yellow-50 inline-block px-2 py-1 rounded">
                        <span className="font-semibold">INDICAÇÃO:</span> {item.indicacaoTexto}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                    title="Remover"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORIENTAÇÕES GERAIS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b pb-2 mb-4">Orientações Gerais</h2>
          <textarea
            value={receita.orientacoesGerais || ''}
            onChange={(e) => setReceita({ ...receita, orientacoesGerais: e.target.value.toUpperCase() })}
            placeholder="ORIENTAÇÕES ADICIONAIS PARA O PACIENTE..."
            rows={4}
            className="w-full border rounded-md px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>
    </div>
  );
}
