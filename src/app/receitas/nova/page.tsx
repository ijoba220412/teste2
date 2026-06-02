'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Medicamento, Paciente, Profissional, Instituicao } from '@/types';
import { calculateHours, generateMealIcons, MEDICATION_ICONS, MealIcon } from '@/utils/generateHorarios';
import { Plus, Trash2, Save, FileText, Activity, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Item local da receita (estado interno do formulário)
interface ReceitaItem {
  tempId: string;
  medicationId: string;
  nome: string;
  apresentacao: string;
  dosagem: string;
  doseQuantity: number;
  frequency: number;
  startHour: string;
  calculatedHours: string[];
  mealIcons: MealIcon[];
  indicacao: string;
  tipo: 'continuo' | 'sos';
}

export default function NovaReceita() {
  const router = useRouter();
  
  // Dados do banco
  const [pacientes, setPacientes] = useState<Array<Paciente & { id: string }>>([]);
  const [medicamentos, setMedicamentos] = useState<Array<Medicamento & { id: string }>>([]);
  const [profissionais, setProfissionais] = useState<Array<Profissional & { id: string }>>([]);
  const [instituicoes, setInstituicoes] = useState<Array<Instituicao & { id: string }>>([]);
  
  // Seleções principais
  const [pacienteId, setPacienteId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [farmaceuticoId, setFarmaceuticoId] = useState('');
  const [instituicaoId, setInstituicaoId] = useState('');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  
  // Itens da receita
  const [items, setItems] = useState<ReceitaItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carrega todos os dados necessários ao montar o componente
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [pSnap, mSnap, profSnap, instSnap] = await Promise.all([
          getDocs(collection(db, 'pacientes')),
          getDocs(collection(db, 'medicamentos_padrao')),
          getDocs(collection(db, 'profissionais')),
          getDocs(collection(db, 'instituicoes')),
        ]);
        
        setPacientes(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Paciente & { id: string })));
        setMedicamentos(mSnap.docs.map(d => ({ id: d.id, ...d.data() } as Medicamento & { id: string })));
        setProfissionais(profSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profissional & { id: string })));
        setInstituicoes(instSnap.docs.map(d => ({ id: d.id, ...d.data() } as Instituicao & { id: string })));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('ERRO AO CARREGAR DADOS INICIAIS');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addMedication = () => {
    if (medicamentos.length === 0) {
      alert('CADASTRE UM MEDICAMENTO PRIMEIRO');
      return;
    }
    
    const med = medicamentos[0];
    const startHour = '06:00';
    const frequency = 2;
    const calc = calculateHours(startHour, frequency);
    
    const newItem: ReceitaItem = {
      tempId: `temp_${Date.now()}_${Math.random()}`,
      medicationId: med.id || '',
      nome: med.nomeComercial || med.nome || '',
      apresentacao: med.apresentacao || 'comprimido',
      dosagem: med.dosagem || '',
      doseQuantity: 1,
      frequency,
      startHour,
      calculatedHours: calc,
      mealIcons: generateMealIcons(calc),
      // ✅ USA A INDICAÇÃO QUE JÁ VEM DO MEDICAMENTO CADASTRADO
      indicacao: med.indicacao || 'CONFORME PRESCRIÇÃO',
      tipo: 'continuo',
    };
    
    setItems([...items, newItem]);
  };

  const updateItem = (tempId: string, patch: Partial<ReceitaItem>) => {
    const updated = items.map(item => {
      if (item.tempId !== tempId) return item;
      
      const merged = { ...item, ...patch };
      
      // Recalcula horários se mudar frequência ou hora inicial
      if (patch.frequency || patch.startHour) {
        merged.calculatedHours = calculateHours(merged.startHour, merged.frequency);
        merged.mealIcons = generateMealIcons(merged.calculatedHours);
      }
      
      // Atualiza dados do medicamento se trocar a seleção
      if (patch.medicationId) {
        const med = medicamentos.find(m => m.id === patch.medicationId);
        if (med) {
          merged.nome = med.nomeComercial || med.nome || '';
          merged.apresentacao = med.apresentacao || 'comprimido';
          merged.dosagem = med.dosagem || '';
          // ✅ MANTÉM A INDICAÇÃO DO MEDICAMENTO SELECIONADO
          merged.indicacao = med.indicacao || 'CONFORME PRESCRIÇÃO';
        }
      }
      
      return merged;
    });
    
    setItems(updated);
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId));
  };

  const save = async () => {
    if (!pacienteId) return alert('SELECIONE UM PACIENTE');
    if (!medicoId) return alert('SELECIONE UM MÉDICO PRESCRITOR');
    if (items.length === 0) return alert('ADICIONE AO MENOS UM MEDICAMENTO');
    
    // Validação de cápsulas inteiras
    const capsulaFracionada = items.find(
      item => item.apresentacao === 'capsula' && !Number.isInteger(item.doseQuantity)
    );
    if (capsulaFracionada) {
      alert(`CÁPSULAS NÃO PODEM SER PARTIDAS! VERIFIQUE O MEDICAMENTO: ${capsulaFracionada.nome.toUpperCase()}`);
      return;
    }
    
    setSaving(true);
    
    try {
      const paciente = pacientes.find(p => p.id === pacienteId);
      const medico = profissionais.find(p => p.id === medicoId);
      const farmaceutico = profissionais.find(p => p.id === farmaceuticoId);
      const instituicao = instituicoes.find(i => i.id === instituicaoId);
      
      // Separa em contínuos e SOS
      const continuos = items.filter(i => i.tipo === 'continuo');
      const sos = items.filter(i => i.tipo === 'sos');
      
      // Formata para a estrutura REAL do seu Firestore
      const medicamentos_fixos = continuos.map(item => ({
        nome: item.nome.toUpperCase(),
        texto_original_da_posologia: `${item.doseQuantity} ${item.apresentacao}(s) - ${item.frequency}x ao dia`.toUpperCase(),
        indicacao: item.indicacao.toUpperCase(),
        horarios: item.calculatedHours,
        intervalo: Math.floor(24 / item.frequency),
        horaInicio: item.startHour,
        doseQuantity: item.doseQuantity,
        apresentacao: item.apresentacao,
      }));
      
      const medicamentos_sos = sos.map(item => ({
        nome: item.nome.toUpperCase(),
        texto_original_da_posologia: `${item.doseQuantity} ${item.apresentacao}(s) - SE NECESSÁRIO`.toUpperCase(),
        indicacao: item.indicacao.toUpperCase(),
        horarios: item.calculatedHours,
        intervalo: Math.floor(24 / item.frequency),
        horaInicio: item.startHour,
        doseQuantity: item.doseQuantity,
        apresentacao: item.apresentacao,
      }));
      
      const itens = items.map(item => ({
        nomeMedicamento: item.nome.toUpperCase(),
        dose: item.dosagem.toUpperCase(),
        horarios: item.calculatedHours,
        intervalo: Math.floor(24 / item.frequency),
        indicacao: item.indicacao.toUpperCase(),
        horaInicio: item.startHour,
        doseQuantity: item.doseQuantity,
        apresentacao: item.apresentacao,
      }));
      
      await addDoc(collection(db, 'receitas'), {
        // Paciente
        nomePaciente: paciente?.nome?.toUpperCase() || '',
        prontuario: paciente?.matricula || '',
        pacienteId,
        data_nasc: paciente?.dataNascimento || '',
        alergias: paciente?.alergias || '',
        
        // Profissionais
        medico: medico?.nome?.toUpperCase() || '',
        medico_id: medico?.numeroRegistro ? `${medico.orgao}/${medico.uf} ${medico.numeroRegistro}` : '',
        profissionalId: medicoId,
        farmaceutico: farmaceutico?.nome?.toUpperCase() || '',
        farmaceutico_id: farmaceutico?.numeroRegistro ? `${farmaceutico.orgao}/${farmaceutico.uf} ${farmaceutico.numeroRegistro}` : '',
        
        // Instituição
        instituicaoId,
        nomeInstituicao: instituicao?.nome || '',
        
        // Datas
        dataEmissao,
        data_criacao: new Date().toISOString(),
        
        // Medicamentos (estrutura real)
        medicamentos_fixos,
        medicamentos_sos,
        itens,
        
        // Metadados
        status: 'ativa',
        tipo: continuos.length > 0 && sos.length > 0 ? 'ambos' : (continuos.length > 0 ? 'continuo' : 'sos'),
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('ERRO AO SALVAR RECEITA');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO DADOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-teal-700" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
            NOVA RECEITA FACILITADA
          </h1>
        </div>

        {/* DADOS GERAIS */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-200 pb-2">
            DADOS DA RECEITA
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">PACIENTE *</label>
              <select
                value={pacienteId}
                onChange={e => setPacienteId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white"
              >
                <option value="">SELECIONE UM PACIENTE</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - PRONTUÁRIO: {p.matricula}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">DATA DE EMISSÃO *</label>
              <input
                type="date"
                value={dataEmissao}
                onChange={e => setDataEmissao(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">MÉDICO PRESCRITOR *</label>
              <select
                value={medicoId}
                onChange={e => setMedicoId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white"
              >
                <option value="">SELECIONE UM MÉDICO</option>
                {profissionais
                  .filter(p => p.cargo?.toUpperCase().includes('MÉDIC') || p.cargo?.toUpperCase().includes('MEDICO'))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      DR(A). {p.nome} - {p.orgao}/{p.uf} {p.numeroRegistro}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">FARMACÊUTICO RESPONSÁVEL</label>
              <select
                value={farmaceuticoId}
                onChange={e => setFarmaceuticoId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white"
              >
                <option value="">SELECIONE UM FARMACÊUTICO (OPCIONAL)</option>
                {profissionais
                  .filter(p => p.cargo?.toUpperCase().includes('FARMAC'))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} - {p.orgao}/{p.uf} {p.numeroRegistro}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">INSTITUIÇÃO</label>
              <select
                value={instituicaoId}
                onChange={e => setInstituicaoId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white"
              >
                <option value="">SELECIONE UMA INSTITUIÇÃO (OPCIONAL)</option>
                {instituicoes.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.nome} - {i.cidade}/{i.uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LISTA DE MEDICAMENTOS */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.tempId} className="bg-white rounded-2xl shadow-md p-6">
              
              {/* Linha 1: Medicamento, Tipo, Quantidade, Excluir */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                <div className="lg:col-span-6">
                  <label className="text-xs font-bold text-gray-600 uppercase">MEDICAMENTO</label>
                  <select
                    value={item.medicationId}
                    onChange={e => updateItem(item.tempId, { medicationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white text-sm"
                  >
                    {medicamentos.map(m => (
                      <option key={m.id} value={m.id}>
                        {(m.nomeComercial || m.nome || '').toUpperCase()} - {(m.indicacao || 'SEM INDICAÇÃO').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">TIPO DE USO</label>
                  <select
                    value={item.tipo}
                    onChange={e => updateItem(item.tempId, { tipo: e.target.value as 'continuo' | 'sos' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white text-sm"
                  >
                    <option value="continuo">CONTÍNUO</option>
                    <option value="sos">SOS</option>
                  </select>
                </div>

                <div className="lg:col-span-3">
                  <label className="text-xs font-bold text-gray-600 uppercase">QUANTIDADE POR DOSE</label>
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={item.doseQuantity}
                    onChange={e => updateItem(item.tempId, { doseQuantity: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase text-sm"
                  />
                </div>

                <div className="lg:col-span-1 flex items-end justify-end">
                  <button
                    onClick={() => removeItem(item.tempId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="EXCLUIR"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Linha 2: Frequência e Horário Inicial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">FREQUÊNCIA (VEZES AO DIA)</label>
                  <select
                    value={item.frequency}
                    onChange={e => updateItem(item.tempId, { frequency: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white text-sm"
                  >
                    {[1, 2, 3, 4, 6, 8, 12].map(n => (
                      <option key={n} value={n}>
                        {n}X AO DIA (A CADA {24/n}H)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">HORÁRIO INICIAL</label>
                  <input
                    type="time"
                    value={item.startHour}
                    onChange={e => updateItem(item.tempId, { startHour: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase text-sm"
                  />
                </div>
              </div>

              {/* Preview Visual */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-5 border-2 border-teal-200">
                <p className="text-xs font-bold tracking-wider text-teal-800 mb-3 uppercase flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  COMO O PACIENTE VAI VER:
                </p>
                
                {/* Doses */}
                <div className="flex flex-wrap items-center gap-2 text-4xl mb-4">
                  {Array.from({ length: Math.floor(item.doseQuantity) }).map((_, i) => (
                    <img
                      key={i}
                      src={MEDICATION_ICONS[item.apresentacao] || MEDICATION_ICONS.comprimido}
                      alt={item.apresentacao}
                      className="w-12 h-12 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ))}
                  {item.doseQuantity % 1 !== 0 && (
                    <div className="relative w-12 h-12">
                      <img
                        src={MEDICATION_ICONS.comprimido}
                        alt="meio comprimido"
                        className="w-12 h-12 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Horários */}
                <div className="flex flex-wrap gap-3">
                  {item.mealIcons.map((mi, i) => (
                    <div key={i} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 border border-teal-100">
                      <img
                        src={mi.icon}
                        alt={mi.label}
                        className="w-10 h-10 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <p className="font-bold text-gray-800 text-xs uppercase">{mi.label}</p>
                        <p className="text-xs text-gray-500 font-semibold">{mi.hour}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Indicação do medicamento (automática) */}
                <div className="mt-4 pt-4 border-t border-teal-200">
                  <p className="text-xs font-bold text-gray-700 mb-2 uppercase">
                    PARA QUE SERVE:
                  </p>
                  <div className="bg-white rounded-xl p-3 shadow border-2 border-teal-200">
                    <p className="text-sm font-bold text-gray-700 uppercase">{item.indicacao}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÕES FINAIS */}
        <div className="flex flex-wrap gap-4 sticky bottom-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
          <button
            onClick={addMedication}
            className="flex items-center gap-2 px-6 py-3 border-2 border-teal-700 text-teal-700 rounded-xl hover:bg-teal-50 transition-colors uppercase font-semibold"
          >
            <Plus className="w-5 h-5" /> ADICIONAR MEDICAMENTO
          </button>
          <button
            onClick={save}
            disabled={items.length === 0 || saving}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl transition-colors uppercase font-semibold shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'SALVANDO...' : 'SALVAR RECEITA'}
          </button>
        </div>

      </div>
    </div>
  );
}
