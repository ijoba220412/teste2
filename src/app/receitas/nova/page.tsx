'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/hooks/useFirestore';
import { Paciente, Medicamento, Profissional, Instituicao, Receita } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, X, Clock, Plus, ChevronRight } from 'lucide-react';

function NovaReceitaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get('pacienteId');

  const { data: pacientes, list: listPac } = useFirestore<Paciente>('pacientes');
  const { data: medsPadrao, list: listMeds } = useFirestore<Medicamento>('medicamentos_padrao');
  const { data: profissionais, list: listProf } = useFirestore<Profissional>('profissionais');
  const { data: instituicoes, list: listInst } = useFirestore<Instituicao>('instituicoes');
  const { add: addReceita } = useFirestore<Receita>('receitas');

  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [medEmPreparo, setMedEmPreparo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    medico_id: '',
    farmaceutico_id: '',
    instituicaoId: '',
    medicamentos_fixos: [] as any[],
    medicamentos_sos: [] as any[],
    itens: [] as any[]
  });

  useEffect(() => {
    listPac(); listMeds(); listProf(); listInst();
  }, []);

  useEffect(() => {
    if (pacienteId && pacientes.length > 0) {
      const p = pacientes.find(p => p.id === pacienteId);
      if (p) {
        setSelectedPaciente(p);
        setFormData(prev => ({ ...prev, instituicaoId: p.instituicaoId || '' }));
      }
    }
  }, [pacienteId, pacientes]);

  const calcularGradeHorarios = (inicio: string, intervalo: number) => {
    if (!inicio) return [];
    const [h, m] = inicio.split(':').map(Number);
    const lista = [];
    const tomadas = 24 / intervalo;
    for (let i = 0; i < tomadas; i++) {
      const novaHora = (h + (i * intervalo)) % 24;
      lista.push(`${novaHora.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    return lista.sort();
  };

  const prepararMedicamento = (med: Medicamento) => {
    setMedEmPreparo({
      ...med,
      tipo: 'HORARIO',
      doseValue: '1',
      horaInicial: '08:00',
      intervalo: 24,
      horarios: ['08:00'],
      posologiaSOS: 'TOMAR 1 DOSE SE NECESSÁRIO'
    });
  };

  const incluirNaPrescricao = () => {
    if (!medEmPreparo) return;

    if (medEmPreparo.tipo === 'HORARIO') {
      const novoItem = {
        nomeMedicamento: medEmPreparo.nome,
        apresentacao: medEmPreparo.apresentacao || 'un',
        dose: `${medEmPreparo.doseValue} ${medEmPreparo.apresentacao || 'un'}`,
        horarios: medEmPreparo.horarios,
        indicacao: medEmPreparo.indicacao || 'CONFORME PRESCRIÇÃO'
      };
      setFormData(prev => ({ ...prev, itens: [...prev.itens, novoItem] }));
    } else {
      const novoSOS = {
        nome: medEmPreparo.nome,
        texto_original_da_posologia: medEmPreparo.posologiaSOS,
        indicacao: medEmPreparo.indicacao || 'SE NECESSÁRIO'
      };
      setFormData(prev => ({ ...prev, medicamentos_sos: [...prev.medicamentos_sos, novoSOS] }));
    }

    setMedEmPreparo(null);
  };

  const handleSave = async () => {
    // Validação rigorosa
    if (!formData.instituicaoId || !formData.medico_id) {
      alert("Por favor, selecione a Instituição e o Médico Responsável antes de finalizar.");
      return;
    }

    const medico = profissionais.find(p => p.id === formData.medico_id);
    const farmaceutico = profissionais.find(p => p.id === formData.farmaceutico_id);

    const payload = {
      ...formData,
      pacienteId: selectedPaciente?.id,
      nomePaciente: selectedPaciente?.nome,
      prontuario: selectedPaciente?.prontuario,
      data_nasc: selectedPaciente?.nascimento,
      dataEmissao: new Date().toISOString(),
      medico: medico?.nome || '',
      farmaceutico: farmaceutico?.nome || '',
    };

    try {
      await addReceita(payload as any);
      router.push(`/receitas/imprimir/${selectedPaciente?.id}`);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a receita no banco de dados.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 uppercase font-black space-y-6 bg-white min-h-screen">
      <header className="flex justify-between items-center border-b-4 border-teal-500 pb-2 mb-6">
        <h1 className="text-3xl text-teal-900 italic">NOVA PRESCRIÇÃO</h1>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">PACIENTE EM ATENDIMENTO</p>
          <p className="text-lg text-teal-700">{selectedPaciente?.nome || 'CARREGANDO...'}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BANCO DE MEDICAMENTOS */}
        <aside className="lg:col-span-3">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 h-[650px] overflow-y-auto">
            <h2 className="text-[10px] text-slate-400 mb-4 border-b pb-2 text-center tracking-widest">SELECIONE O MEDICAMENTO</h2>
            {medsPadrao.map(med => (
              <button 
                key={med.id} 
                onClick={() => prepararMedicamento(med)}
                className="w-full text-left p-3 mb-2 bg-white border border-slate-100 rounded-xl hover:border-teal-400 hover:shadow-md transition-all flex justify-between items-center group"
              >
                <span className="text-[10px] text-teal-900">{med.nome}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500" />
              </button>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {/* SELEÇÃO DE RESPONSÁVEIS */}
          <Card className="grid grid-cols-3 gap-4 bg-teal-50/30 border-2 border-teal-100 shadow-sm">
            <div>
              <label className="text-[9px] text-teal-600 mb-1 block">INSTITUIÇÃO</label>
              <select className="w-full p-2 rounded-lg border-2 border-white text-xs font-bold focus:border-teal-400 outline-none" value={formData.instituicaoId} onChange={e => setFormData({...formData, instituicaoId: e.target.value})}>
                <option value="">SELECIONE...</option>
                {instituicoes.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-teal-600 mb-1 block">MÉDICO(A) RESPONSÁVEL</label>
              <select className="w-full p-2 rounded-lg border-2 border-white text-xs font-bold focus:border-teal-400 outline-none" value={formData.medico_id} onChange={e => setFormData({...formData, medico_id: e.target.value})}>
                <option value="">SELECIONE...</option>
                {profissionais.filter(p => p.cargo === 'Médico(a)').map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-teal-600 mb-1 block">FARMACÊUTICO(A)</label>
              <select className="w-full p-2 rounded-lg border-2 border-white text-xs font-bold focus:border-teal-400 outline-none" value={formData.farmaceutico_id} onChange={e => setFormData({...formData, farmaceutico_id: e.target.value})}>
                <option value="">OPCIONAL...</option>
                {profissionais.filter(p => p.cargo === 'Farmacêutico(a)').map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </Card>

          {/* ÁREA DE PREPARO DINÂMICO */}
          {medEmPreparo && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <Card className="border-4 border-teal-500 bg-white relative shadow-xl">
                <button onClick={() => setMedEmPreparo(null)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500"><X size={24}/></button>
                <h3 className="text-teal-900 font-black mb-6 flex items-center gap-2">
                  <Plus className="bg-teal-500 text-white rounded p-1" /> CONFIGURANDO: {medEmPreparo.nome}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 block">TIPO DE USO</label>
                    <select className="w-full p-3 border-2 rounded-xl text-xs font-bold bg-slate-50" value={medEmPreparo.tipo} onChange={e => setMedEmPreparo({...medEmPreparo, tipo: e.target.value})}>
                      <option value="HORARIO">HORÁRIO FIXO</option>
                      <option value="SOS">SOS (SE NECESSÁRIO)</option>
                    </select>
                  </div>

                  {medEmPreparo.tipo === 'HORARIO' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 block">QUANTIDADE ({medEmPreparo.apresentacao || 'UN'})</label>
                        <input type="number" className="w-full p-3 border-2 rounded-xl text-xs font-bold bg-slate-50" value={medEmPreparo.doseValue} onChange={e => setMedEmPreparo({...medEmPreparo, doseValue: e.target.value})}/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 block">1º HORÁRIO</label>
                        <input type="time" className="w-full p-3 border-2 rounded-xl text-xs font-bold bg-slate-50" value={medEmPreparo.horaInicial} onChange={e => {
                          const h = e.target.value;
                          setMedEmPreparo({...medEmPreparo, horaInicial: h, horarios: calcularGradeHorarios(h, medEmPreparo.intervalo)});
                        }}/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 block">INTERVALO</label>
                        <select className="w-full p-3 border-2 rounded-xl text-xs font-bold bg-slate-50" value={medEmPreparo.intervalo} onChange={e => {
                          const i = Number(e.target.value);
                          setMedEmPreparo({...medEmPreparo, intervalo: i, horarios: calcularGradeHorarios(medEmPreparo.horaInicial, i)});
                        }}>
                          <option value={24}>A CADA 24 HORAS</option>
                          <option value={12}>A CADA 12 HORAS</option>
                          <option value={8}>A CADA 08 HORAS</option>
                          <option value={6}>A CADA 06 HORAS</option>
                          <option value={4}>A CADA 04 HORAS</option>
                          <option value={2}>A CADA 02 HORAS</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[9px] text-slate-500 block">POSOLOGIA SOS</label>
                      <input className="w-full p-3 border-2 rounded-xl text-xs font-bold bg-slate-50" value={medEmPreparo.posologiaSOS} onChange={e => setMedEmPreparo({...medEmPreparo, posologiaSOS: e.target.value.toUpperCase()})}/>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                   <div className="flex gap-2">
                     {medEmPreparo.tipo === 'HORARIO' && medEmPreparo.horarios.map((h: string) => (
                       <span key={h} className="bg-white border-2 border-teal-200 text-teal-700 px-3 py-1 rounded-lg text-xs font-black shadow-sm">{h}</span>
                     ))}
                   </div>
                   <Button onClick={incluirNaPrescricao} className="bg-teal-600 hover:bg-teal-700 px-8 py-3 text-sm rounded-xl transition-transform active:scale-95 shadow-lg">
                      + INCLUIR NA PRESCRIÇÃO
                   </Button>
                </div>
              </Card>
            </div>
          )}

          {/* LISTA FINAL DE PRESCRIÇÃO */}
          <div className="space-y-6 pt-4">
             {formData.itens.length > 0 && (
               <div className="space-y-3">
                 <h4 className="text-cyan-700 text-xs flex items-center gap-2 tracking-widest"><Clock size={16}/> PRESCRIÇÕES COM HORÁRIOS FIXOS</h4>
                 {formData.itens.map((item, i) => (
                   <Card key={i} className="border-l-8 border-cyan-500 py-4 px-6 flex justify-between items-center group bg-white shadow-sm hover:shadow-md transition-all">
                      <div>
                        <p className="text-sm text-cyan-950 font-black">{item.nomeMedicamento} — {item.dose}</p>
                        <div className="flex gap-2 mt-2">
                           {item.horarios.map((h: string) => <span key={h} className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md font-bold border border-cyan-100">{h}</span>)}
                        </div>
                      </div>
                      <button onClick={() => {const n = [...formData.itens]; n.splice(i,1); setFormData({...formData, itens:n})}} className="text-slate-200 hover:text-red-500 transition-colors"><X size={20}/></button>
                   </Card>
                 ))}
               </div>
             )}

             {formData.medicamentos_sos.length > 0 && (
               <div className="space-y-3">
                 <h4 className="text-orange-600 text-xs flex items-center gap-2 tracking-widest">⚠️ MEDICAMENTOS SOS</h4>
                 {formData.medicamentos_sos.map((med, i) => (
                   <Card key={i} className="border-l-8 border-orange-500 py-4 px-6 flex justify-between items-center bg-white shadow-sm">
                      <div>
                        <p className="text-sm text-orange-900 font-black">{med.nome}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 bg-orange-50 px-2 py-1 rounded inline-block">{med.texto_original_da_posologia}</p>
                      </div>
                      <button onClick={() => {const n = [...formData.medicamentos_sos]; n.splice(i,1); setFormData({...formData, medicamentos_sos:n})}} className="text-slate-200 hover:text-red-500"><X size={20}/></button>
                   </Card>
                 ))}
               </div>
             )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-teal-500 flex justify-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <Button onClick={handleSave} className="w-full max-w-5xl py-7 bg-teal-800 text-2xl shadow-2xl hover:bg-teal-900 transition-all font-black tracking-widest border-2 border-white">
          <Save className="mr-4" size={32}/> SALVAR E GERAR PDF
        </Button>
      </div>
    </div>
  );
}

export default function NovaReceitaPage() {
  return <Suspense fallback={<div className="p-20 text-center font-black animate-pulse text-teal-800 uppercase">INICIALIZANDO BANCO DE DADOS...</div>}><NovaReceitaForm /></Suspense>;
}