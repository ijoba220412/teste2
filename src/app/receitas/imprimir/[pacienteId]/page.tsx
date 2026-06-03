'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita, Instituicao } from '@/types';
import { 
  Printer, ArrowLeft, User, Calendar, FileText, Stethoscope,
  AlertCircle, MapPin, Phone, History, Check,
  Sun, Coffee, Utensils, Sunset, Moon
} from 'lucide-react';

// ============================================================================
// CONSTANTES - HORÁRIOS
// ============================================================================
const SCHEDULE_SLOTS = [
  { id: 'madrugada', label: 'Madrugada', time: '00:00', icon: Moon },
  { id: 'acordar', label: 'Ao Acordar', time: '06:00', icon: Sun },
  { id: 'cafe', label: 'Café', time: '08:00', icon: Coffee },
  { id: 'almoco', label: 'Almoço', time: '12:00', icon: Utensils },
  { id: 'tarde', label: 'Tarde', time: '15:00', icon: Sun },
  { id: 'fim_tarde', label: 'Fim Tarde', time: '18:00', icon: Sunset },
  { id: 'jantar', label: 'Jantar', time: '20:00', icon: Utensils },
  { id: 'dormir', label: 'Dormir', time: '22:00', icon: Moon },
];

// ============================================================================
// COMPONENTES VISUAIS DAS FORMAS FARMACÊUTICAS - TAMANHOS GRANDES
// ============================================================================

const ComprimidoIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <circle cx={size/2} cy={size/2} r={size/2 - 3} fill="#0f766e" stroke="#0f766e" strokeWidth="2"/>
    <line x1={size/4 + 2} y1={size - size/4 - 2} x2={size - size/4 - 2} y2={size/4 + 2} stroke="white" strokeWidth="3"/>
  </svg>
);

const CapsulaIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
    <rect x="0" y="0" width={size} height={size * 0.6} rx={size * 0.3} fill="currentColor" stroke="#0f766e" strokeWidth="2" className="text-teal-700"/>
    <path d={`M ${size/2} 0 L ${size/2} ${size * 0.6}`} stroke="#0f766e" strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

const CopoMedidorIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-teal-700">
    <path d="M 5 7 L 19 7 L 17 19 L 7 19 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="7.5" y1="15" x2="16.5" y2="15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const GotaIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-teal-700">
    <path d="M12 2 C12 2 6 10 6 14 C6 17.31 8.69 20 12 20 C15.31 20 18 17.31 18 14 C18 10 12 2 12 2 Z" 
          fill="currentColor" stroke="#0f766e" strokeWidth="1.5"/>
    <ellipse cx="10" cy="13" rx="2" ry="3" fill="white" opacity="0.6"/>
  </svg>
);

const getFormIcon = (form?: string, size: number = 40) => {
  const formLower = form?.toLowerCase() || '';
  if (formLower.includes('capsula') || formLower.includes('cápsula')) {
    return <CapsulaIcon size={size} />;
  } else if (formLower.includes('xarope') || formLower.includes('líquido') || formLower.includes('liquido') || formLower.includes('solução') || formLower.includes('solucao')) {
    return <CopoMedidorIcon size={size} />;
  } else if (formLower.includes('gota')) {
    return <GotaIcon size={size} />;
  }
  return <ComprimidoIcon size={size} />;
};

const MedicationVisual = ({ dose, form }: { dose: string; form?: string }) => {
  const doseNum = parseInt(dose) || 1;
  const maxPills = Math.min(doseNum, 4);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: maxPills }).map((_, i) => (
        <div key={i}>{getFormIcon(form, 40)}</div>
      ))}
      {doseNum > 4 && <span className="text-xs font-black text-teal-700 ml-1">+{doseNum - 4}</span>}
    </div>
  );
};

const MedicationTypeIcon = ({ form }: { form?: string }) => getFormIcon(form, 24);

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
function formatDate(dateStr: string | any | undefined | null): string {
  if (!dateStr) return 'NÃO INFORMADA';
  if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  try {
    const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  } catch {}
  return 'NÃO INFORMADA';
}

function getSymptomImage(symptomName: string | undefined): string | null {
  if (!symptomName) return null;
  const name = symptomName.toLowerCase().trim();
  const symptomMap: Record<string, string> = {
    'sono': 'sono.png', 'insônia': 'insonia.png', 'insonia': 'insonia.png', 'dormir': 'sono.png',
    'noite': 'sono.png', 'dificuldade para dormir': 'insonia.png',
    'dor': 'dor.png', 'dor leve': 'dor.png', 'dor intensa': 'dorintensa.png', 'dor de cabeça': 'dor.png',
    'agitação': 'agitacao.png', 'ansiedade': 'ansiedade.png', 'asma': 'asma.png',
    'câncer': 'cancermama.png', 'cancer': 'cancermama.png', 'circulação': 'circulacao.png',
    'colesterol': 'colesterol.png', 'constipação': 'constipacao.png', 'coração': 'coracao.png',
    'depressão': 'depressao.png', 'diabetes': 'diabete.png', 'diarreia': 'diarreia.png',
    'estômago': 'dorestomago.png', 'fadiga': 'fadiga.png', 'falta de ar': 'faltaar.png',
    'infecção': 'infeccao.png', 'náusea': 'nausea.png', 'vômito': 'vomito.png',
    'osso': 'ossos.png', 'perda de apetite': 'perdaapetite.png', 'pressão alta': 'pressaoalta.png',
    'proteger estômago': 'protegerestomago.png', 'pulmão': 'pulmao.png', 'tosse': 'tosse.png',
    'trombose': 'trombose.png',
  };
  if (symptomMap[name]) return `/img/n/f/${symptomMap[name]}`;
  for (const [key, file] of Object.entries(symptomMap)) {
    if (name.includes(key)) return `/img/n/f/${file}`;
  }
  return null;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ImprimirReceita() {
  const params = useParams();
  const router = useRouter();
  const receitaId = params?.pacienteId as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [receita, setReceita] = useState<Receita | null>(null);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = () => setTimeout(() => window.print(), 200);

  useEffect(() => {
    (async () => {
      try {
        if (!receitaId) {
          setError('ID DA RECEITA NÃO INFORMADO');
          setLoading(false);
          return;
        }
        const snap = await getDoc(doc(db, 'receitas', receitaId));
        if (!snap.exists()) {
          setError('RECEITA NÃO ENCONTRADA');
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as Receita;
        setReceita(data);
        if (data.instituicaoId) {
          const instSnap = await getDoc(doc(db, 'instituicoes', data.instituicaoId));
          if (instSnap.exists()) {
            setInstituicao({ id: instSnap.id, ...instSnap.data() } as Instituicao);
          }
        }
      } catch (err) {
        console.error(err);
        setError('ERRO AO CARREGAR RECEITA');
      } finally {
        setLoading(false);
      }
    })();
  }, [receitaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-700 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO RECEITA...</p>
        </div>
      </div>
    );
  }

  if (error || !receita) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center">
        <div className="max-w-md mx-auto bg-white border-2 border-red-300 rounded-2xl p-8 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-700 uppercase mb-4">{error || 'RECEITA NÃO ENCONTRADA'}</p>
          <button onClick={() => router.push('/dashboard')} className="bg-teal-700 text-white px-6 py-3 rounded-xl uppercase font-semibold hover:bg-teal-600 transition-colors">
            VOLTAR AO INÍCIO
          </button>
        </div>
      </div>
    );
  }

  const fixedMedications = receita.medicamentos_fixos || [];
  const sosMedications = receita.medicamentos_sos || [];
  const instNome = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO';
  const instEndereco = instituicao
    ? `${instituicao.rua || ''}, ${instituicao.numero || ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''} - CEP: ${instituicao.cep || ''}`
    : '';
  const instTelefone = instituicao?.telefone1 || '';

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* BOTÕES DE AÇÃO */}
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-700 font-semibold uppercase hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5" /> VOLTAR
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg">
          <Printer className="h-5 w-5" /> IMPRIMIR / PDF
        </button>
      </div>

      {/* FOLHA DA RECEITA */}
      <div ref={printRef} id="prescription-paper" className="max-w-5xl mx-auto mt-6 bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:mt-0 print:p-8 print:w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-6 mb-8 text-center sm:text-left gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Stethoscope className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">RECEITA MÉDICA FACILITADA</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{instNome}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm font-bold text-slate-400 uppercase">DATA DE EMISSÃO</p>
            <p className="text-lg font-black text-slate-900">{formatDate(receita.dataEmissao || receita.data_criacao)}</p>
          </div>
        </div>

        {/* DADOS DO PACIENTE */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 rounded-2xl bg-slate-50 p-6 border border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm"><User className="h-5 w-5 text-teal-700" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PACIENTE</p><p className="text-lg font-black text-slate-900 uppercase">{receita.nomePaciente || 'NÃO INFORMADO'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm"><Calendar className="h-5 w-5 text-teal-700" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">NASCIMENTO</p><p className="text-lg font-black text-slate-900">{formatDate(receita.data_nasc)}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm"><FileText className="h-5 w-5 text-teal-700" /></div>
              <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PRONTUÁRIO</p><p className="text-lg font-black text-slate-900">{receita.prontuario || 'NÃO INFORMADO'}</p></div>
            </div>
          </div>
          <div>
            {receita.alergias && receita.alergias.trim() !== '' ? (
              <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1"><AlertCircle className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-widest">ATENÇÃO: ALERGIAS</p></div>
                <p className="text-lg font-black text-red-700 uppercase">{receita.alergias.toUpperCase()}</p>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1"><Check className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-widest">ALERGIAS</p></div>
                <p className="text-lg font-black text-green-700 uppercase">NEGA ALERGIAS</p>
              </div>
            )}
          </div>
        </div>

        {/* TABELA DE MEDICAMENTOS FIXOS */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full border-collapse border-b-2 border-slate-900">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-900 p-3 text-sm font-black uppercase leading-tight min-w-[260px] text-left">MEDICAMENTO E MOTIVO</th>
                {SCHEDULE_SLOTS.map(slot => {
                  const Icon = slot.icon;
                  return (
                    <th key={slot.id} className="border border-slate-900 p-2 text-center min-w-[90px]">
                      <div className="flex flex-col items-center"><Icon className="h-6 w-6 mb-1" /><span className="text-[8px] font-black uppercase">{slot.label}</span><span className="text-[9px] font-black opacity-50 mt-1">{slot.time}</span></div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {fixedMedications.length === 0 ? (
                <tr><td colSpan={9} className="border border-slate-300 p-8 text-center text-gray-500 uppercase font-semibold">NENHUM MEDICAMENTO DE USO CONTÍNUO PRESCRITO</td></tr>
              ) : (
                fixedMedications.map((med: any, idx) => {
                  const dose = med.texto_original_da_posologia?.split(' ')[0] || '1';
                  const symptomsList: Array<{ image: string | null; name: string }> = [];
                  if (med.symptoms && Array.isArray(med.symptoms) && med.symptoms.length) {
                    med.symptoms.forEach((s: any) => {
                      let img = s.file ? `/img/n/f/${s.file}` : (s.id ? `/img/n/f/${s.id}.png` : null);
                      if (!img) img = getSymptomImage(s.name || med.indicacao);
                      symptomsList.push({ image: img, name: s.name || med.indicacao || '' });
                    });
                  } else if (med.indicacao) {
                    symptomsList.push({ image: getSymptomImage(med.indicacao), name: med.indicacao });
                  }
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-4 align-top">
                        <div className="flex flex-col gap-3">
                          <div><p className="text-lg font-black text-slate-900 uppercase leading-none mb-2">{med.nome || 'MEDICAMENTO'}</p>
                            <div className="flex items-center gap-2"><div className="rounded bg-teal-100 p-1.5"><MedicationTypeIcon form={med.apresentacao} /></div><p className="text-xs font-bold text-slate-600 italic uppercase">{dose} ({med.apresentacao || 'COMPRIMIDO'})</p></div>
                          </div>
                          {symptomsList.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                              {symptomsList.map((symptom, sIdx) => (
                                <div key={sIdx} className="flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-[100px] bg-pink-50 border-pink-200 shadow-sm">
                                  <div className="mb-1 flex items-center justify-center h-14 w-14">
                                    {symptom.image ? <img src={symptom.image} alt={symptom.name} className="max-h-full max-w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; if ((e.currentTarget as HTMLImageElement).parentElement) (e.currentTarget as HTMLImageElement).parentElement!.innerHTML = '<span class="text-3xl text-gray-400">❓</span>'; }} /> : <span className="text-3xl text-gray-400">❓</span>}
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-center text-pink-700 break-words px-1">PARA {symptom.name.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      {SCHEDULE_SLOTS.map(slot => {
                        const isActive = med.horarios?.some((h: string) => {
                          const hour = parseInt(h.split(':')[0]);
                          if (slot.id === 'madrugada') return hour >= 0 && hour < 6;
                          if (slot.id === 'acordar') return hour >= 6 && hour < 7;
                          if (slot.id === 'cafe') return hour >= 7 && hour < 11;
                          if (slot.id === 'almoco') return hour >= 11 && hour < 14;
                          if (slot.id === 'tarde') return hour >= 14 && hour < 17;
                          if (slot.id === 'fim_tarde') return hour >= 17 && hour < 19;
                          if (slot.id === 'jantar') return hour >= 19 && hour < 21;
                          if (slot.id === 'dormir') return hour >= 21;
                          return false;
                        });
                        return (
                          <td key={slot.id} className="border border-slate-300 text-center p-3 align-middle">
                            {isActive ? <div className="flex flex-col items-center gap-1"><MedicationVisual dose={dose} form={med.apresentacao} /><span className="text-xs font-black uppercase text-teal-600 mt-1">{dose}x</span></div> : <div className="h-2 bg-slate-100 rounded-full mx-2" />}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MEDICAMENTOS SOS */}
        {sosMedications.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl border-4 border-dashed border-teal-500 bg-teal-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-teal-500 p-3 text-white shadow-md"><History className="h-8 w-8" /></div>
              <div><h3 className="text-xl font-black text-teal-900 uppercase tracking-tight">MEDICAMENTOS SOS</h3><p className="text-sm font-bold text-teal-700 uppercase">TOMAR SOMENTE SE NECESSÁRIO</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sosMedications.map((sos: any, i: number) => {
                const symptomsList: Array<{ image: string | null; name: string }> = [];
                if (sos.symptoms && Array.isArray(sos.symptoms) && sos.symptoms.length) {
                  sos.symptoms.forEach((s: any) => {
                    let img = s.file ? `/img/n/f/${s.file}` : (s.id ? `/img/n/f/${s.id}.png` : null);
                    if (!img) img = getSymptomImage(s.name || sos.indicacao);
                    symptomsList.push({ image: img, name: s.name || sos.indicacao || '' });
                  });
                } else if (sos.indicacao) {
                  symptomsList.push({ image: getSymptomImage(sos.indicacao), name: sos.indicacao });
                }
                return (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-teal-200 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-teal-100 p-3"><MedicationTypeIcon form={sos.apresentacao} /></div>
                      <div className="flex-1"><p className="text-lg font-black text-slate-900 uppercase">{sos.nome}</p><p className="text-xs font-bold text-slate-500 uppercase">{sos.texto_original_da_posologia}</p></div>
                    </div>
                    {symptomsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-teal-100">
                        {symptomsList.map((symptom, sIdx) => (
                          <div key={sIdx} className="flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-[90px] bg-pink-50 border-pink-200 shadow-sm">
                            <div className="mb-1 flex items-center justify-center h-12 w-12">
                              {symptom.image ? <img src={symptom.image} alt={symptom.name} className="max-h-full max-w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; if ((e.currentTarget as HTMLImageElement).parentElement) (e.currentTarget as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl text-gray-400">❓</span>'; }} /> : <span className="text-2xl text-gray-400">❓</span>}
                            </div>
                            <span className="text-[8px] font-black uppercase text-center text-pink-700 break-words px-1">PARA {symptom.name.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ASSINATURAS */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-12 text-center pt-8 border-t-2 border-slate-100">
          <div><div className="h-px bg-slate-400 w-full mb-4" /><p className="text-lg font-black text-slate-900 uppercase">{receita.medico || 'NÃO INFORMADO'}</p><p className="text-xs font-bold text-slate-500 uppercase">CRM: {receita.medico_id || 'NÃO INFORMADO'}</p><div className="flex items-center justify-center gap-1 mt-2 text-slate-400"><Stethoscope className="h-4 w-4" /><span className="text-[10px] font-bold uppercase">MÉDICO PRESCRITOR</span></div></div>
          <div><div className="h-px bg-slate-400 w-full mb-4" /><p className="text-lg font-black text-slate-900 uppercase">{receita.farmaceutico || 'PROFISSIONAL FARMACÊUTICO'}</p><p className="text-xs font-bold text-slate-500 uppercase">CRF: {receita.farmaceutico_id || 'NÃO INFORMADO'}</p><div className="flex items-center justify-center gap-1 mt-2 text-slate-400"><Stethoscope className="h-4 w-4" /><span className="text-[10px] font-bold uppercase">DISPENSAÇÃO</span></div></div>
        </div>

        {instEndereco && (
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-sm text-gray-600 uppercase">
            <div className="flex items-center justify-center gap-2 mb-1"><MapPin className="h-4 w-4 text-teal-700" /><span className="font-semibold">{instEndereco}</span></div>
            {instTelefone && <div className="flex items-center justify-center gap-2"><Phone className="h-4 w-4 text-teal-700" /><span className="font-semibold">{instTelefone}</span></div>}
          </div>
        )}
        <div className="mt-8 text-center text-[10px] font-mono text-slate-300 uppercase">RECEITA FACILITADA • {receita.id}</div>
      </div>

      {/* CSS DE IMPRESSÃO SEM USAR styled-jsx */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .no-print { display: none !important; }
            body { background-color: white !important; margin: 0; padding: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            #prescription-paper { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 1.5cm !important; background-color: white !important; box-shadow: none !important; border: none !important; }
            .bg-slate-900, .bg-teal-700, .bg-teal-500, .bg-pink-50, .bg-teal-50 { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .border, .border-slate-300, .border-slate-900, .border-teal-500 { border-color: #000 !important; }
            @page { size: A4; margin: 0.5cm; }
            #prescription-paper { page-break-inside: avoid; }
            .text-lg, .text-xl, .text-2xl { font-size: 14pt !important; }
            svg { max-width: 100% !important; height: auto !important; }
          }
        `
      }} />
    </div>
  );
}