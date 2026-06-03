'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita, Instituicao } from '@/types';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, ArrowLeft, User, Calendar, FileText, Stethoscope,
  AlertCircle, MapPin, Phone, Pill, Clock, History, Check
} from 'lucide-react';

// ============================================================================
// CONSTANTES - HORÁRIOS E SINTOMAS
// ============================================================================
const SCHEDULE_SLOTS = [
  { id: 'madrugada', label: 'Madrugada', time: '00:00', iconName: 'Moon' },
  { id: 'acordar', label: 'Ao Acordar', time: '06:00', iconName: 'Sun' },
  { id: 'cafe', label: 'Café', time: '08:00', iconName: 'Coffee' },
  { id: 'almoco', label: 'Almoço', time: '12:00', iconName: 'Utensils' },
  { id: 'tarde', label: 'Tarde', time: '15:00', iconName: 'Sun' },
  { id: 'fim_tarde', label: 'Fim Tarde', time: '18:00', iconName: 'Sunset' },
  { id: 'jantar', label: 'Jantar', time: '20:00', iconName: 'Utensils' },
  { id: 'dormir', label: 'Dormir', time: '22:00', iconName: 'Moon' },
];

const SYMPTOMS = [
  { id: 'dor', label: 'Dor', color: 'bg-rose-50 border-rose-200', emoji: '😣' },
  { id: 'sono', label: 'Sono', color: 'bg-indigo-50 border-indigo-200', emoji: '😴' },
  { id: 'ansiedade', label: 'Ansiedade', color: 'bg-amber-50 border-amber-200', emoji: '😰' },
  { id: 'coracao', label: 'Coração', color: 'bg-red-50 border-red-200', emoji: '❤️' },
  { id: 'estomago', label: 'Estômago', color: 'bg-yellow-50 border-yellow-200', emoji: '🤢' },
  { id: 'cabeca', label: 'Cabeça', color: 'bg-purple-50 border-purple-200', emoji: '🤕' },
  { id: 'febre', label: 'Febre', color: 'bg-orange-50 border-orange-200', emoji: '🤒' },
  { id: 'tosse', label: 'Tosse', color: 'bg-cyan-50 border-cyan-200', emoji: '😷' },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const IconLoader = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, any> = {
    'Moon': Moon,
    'Sun': (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    'Coffee': Coffee,
    'Utensils': Utensils,
    'Sunset': (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9a4 4 0 0 1 4 4"/><path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    'Pill': Pill,
    'Clock': Clock,
    'History': History,
    'Check': Check,
  };
  const LucideIcon = icons[name] || Pill;
  return <LucideIcon className={className} />;
};

// Componente visual do medicamento (pílula/cápsula)
const MedicationVisual = ({ dose, form }: { dose: string, form?: string }) => {
  const isCapsule = form?.toLowerCase().includes('capsula') || form?.toLowerCase().includes('cápsula');
  const doseNum = parseInt(dose) || 1;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {Array.from({ length: Math.min(doseNum, 5) }).map((_, i) => (
        isCapsule ? (
          // CÁPSULA OVAL
          <svg key={i} width="20" height="12" viewBox="0 0 24 14" className="text-teal-700">
            <rect x="0" y="0" width="24" height="14" rx="7" fill="currentColor" stroke="#0f766e" strokeWidth="1.5"/>
            <path d="M 12 0 L 12 14" stroke="#0f766e" strokeWidth="1" opacity="0.5"/>
          </svg>
        ) : (
          // COMPRIMIDO COM RISCO (Ø)
          <svg key={i} width="16" height="16" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#0f766e" strokeWidth="2"/>
            <line x1="4" y1="16" x2="16" y2="4" stroke="#0f766e" strokeWidth="2"/>
          </svg>
        )
      ))}
    </div>
  );
};

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
      return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
    }
  } catch {}
  return 'NÃO INFORMADA';
}

function getSymptomImage(symptomName: string | undefined): string | null {
  if (!symptomName) return null;
  const name = symptomName.toLowerCase().trim();
  const symptomMap: Record<string, string> = {
    'agitação': 'agitacao.png', 'agitacao': 'agitacao.png',
    'ansiedade': 'ansiedade.png', 'asma': 'asma.png',
    'câncer': 'cancermama.png', 'cancer': 'cancermama.png',
    'circulação': 'circulacao.png', 'circulacao': 'circulacao.png',
    'colesterol': 'colesterol.png',
    'constipação': 'constipacao.png', 'constipacao': 'constipacao.png',
    'coração': 'coracao.png', 'coracao': 'coracao.png',
    'depressão': 'depressao.png', 'depressao': 'depressao.png',
    'diabetes': 'diabete.png', 'diabete': 'diabete.png',
    'diarreia': 'diarreia.png',
    'dor': 'dor.png', 'dor leve': 'dor.png', 'dor intensa': 'dorintensa.png',
    'estômago': 'dorestomago.png', 'estomago': 'dorestomago.png',
    'fadiga': 'fadiga.png',
    'falta de ar': 'faltaar.png', 'faltaar': 'faltaar.png',
    'infecção': 'infeccao.png', 'infeccao': 'infeccao.png',
    'insônia': 'insonia.png', 'insonia': 'insonia.png',
    'náusea': 'nausea.png', 'nausea': 'nausea.png', 'vômito': 'vomito.png', 'vomito': 'vomito.png',
    'osso': 'ossos.png', 'ossos': 'ossos.png',
    'perda de apetite': 'perdaapetite.png', 'perdaapetite': 'perdaapetite.png',
    'pressão alta': 'pressaoalta.png', 'pressaoalta': 'pressaoalta.png',
    'proteger estômago': 'protegerestomago.png', 'protegerestomago': 'protegerestomago.png',
    'pulmão': 'pulmao.png', 'pulmao': 'pulmao.png', 'tosse': 'tosse.png',
    'sono': 'sono.png',
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
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [receita, setReceita] = useState<Receita | null>(null);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuração de impressão
  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `receita-${receita?.nomePaciente?.replace(/\s+/g, '-').toLowerCase() || 'receita'}`,
  });

  useEffect(() => {
    (async () => {
      try {
        if (receitaId) {
          const snap = await getDoc(doc(db, 'receitas', receitaId));
          if (snap.exists()) {
            const data = { id: snap.id, ...snap.data() } as Receita;
            setReceita(data);
            if (data.instituicaoId) {
              const instSnap = await getDoc(doc(db, 'instituicoes', data.instituicaoId));
              if (instSnap.exists()) {
                setInstituicao({ id: instSnap.id, ...instSnap.data() } as Instituicao);
              }
            }
          } else {
            setError('RECEITA NÃO ENCONTRADA');
          }
        } else {
          setError('ID DA RECEITA NÃO INFORMADO');
        }
      } catch (err) {
        console.error('Erro ao carregar receita:', err);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-700 mx-auto mb-4"></div>
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

  const allItems = [...(receita.medicamentos_fixos || []), ...(receita.medicamentos_sos || [])];
  const instNome = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO';
  const instEndereco = instituicao ? `${instituicao.rua || ''}, ${instituicao.numero || ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''} - CEP: ${instituicao.cep || ''}` : '';
  const instTelefone = instituicao?.telefone1 || '';

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      
      {/* BOTÕES DE AÇÃO (não aparecem na impressão) */}
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-700 font-semibold uppercase hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5" /> VOLTAR
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg">
          <Printer className="h-5 w-5" /> IMPRIMIR / PDF
        </button>
      </div>

      {/* FOLHA DA RECEITA */}
      <div ref={contentRef} className="max-w-4xl mx-auto mt-6 bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:mt-0 print:p-0">
        
        {/* ========== HEADER ========== */}
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

        {/* ========== DADOS DO PACIENTE ========== */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 rounded-2xl bg-slate-50 p-6 border border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm">
                <User className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PACIENTE</p>
                <p className="text-lg font-black text-slate-900 uppercase">{receita.nomePaciente || 'NÃO INFORMADO'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm">
                <Calendar className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">NASCIMENTO</p>
                <p className="text-lg font-black text-slate-900">{formatDate(receita.data_nasc)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm">
                <FileText className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PRONTUÁRIO</p>
                <p className="text-lg font-black text-slate-900">{receita.prontuario || 'NÃO INFORMADO'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {receita.alergias && receita.alergias.trim() !== '' ? (
              <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-widest">ATENÇÃO: ALERGIAS</p>
                </div>
                <p className="text-lg font-black text-red-700 uppercase">{receita.alergias.toUpperCase()}</p>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Check className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-widest">ALERGIAS</p>
                </div>
                <p className="text-lg font-black text-green-700 uppercase">NEGA ALERGIAS</p>
              </div>
            )}
          </div>
        </div>

        {/* ========== TABELA DE MEDICAMENTOS ========== */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full border-collapse border-b-2 border-slate-900">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-900 p-3 text-sm font-black uppercase leading-tight min-w-[200px] text-left">
                  MEDICAMENTO E MOTIVO
                </th>
                {SCHEDULE_SLOTS.map(slot => (
                  <th key={slot.id} className="border border-slate-900 p-2 text-center min-w-[60px]">
                    <div className="flex flex-col items-center">
                      <IconLoader name={slot.iconName} className="h-6 w-6 mb-1" />
                      <span className="text-[8px] font-black uppercase leading-tight">{slot.label}</span>
                      <span className="text-[10px] font-black opacity-50 mt-1">{slot.time}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-300 p-8 text-center text-gray-500 uppercase font-semibold">
                    NENHUM MEDICAMENTO PRESCRITO
                  </td>
                </tr>
              ) : (
                allItems.map((med: any, idx) => {
                  const dose = med.texto_original_da_posologia?.split(' ')[0] || '1';
                  
                  let symptomImage = null;
                  let symptomName = med.indicacao || '';
                  if (med.symptoms && Array.isArray(med.symptoms) && med.symptoms.length > 0) {
                    const s = med.symptoms[0];
                    symptomName = s.name || symptomName;
                    if (s.file) symptomImage = `/img/n/f/${s.file}`;
                    else if (s.id) symptomImage = `/img/n/f/${s.id}.png`;
                  }
                  if (!symptomImage) symptomImage = getSymptomImage(symptomName);

                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-4">
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="text-lg font-black text-slate-900 uppercase leading-none mb-1">{med.nome || 'MEDICAMENTO'}</p>
                            <div className="flex items-center gap-2">
                              <div className="rounded bg-teal-100 p-1">
                                <IconLoader name={med.apresentacao?.toLowerCase().includes('capsula') ? 'Pill' : 'Pill'} className="h-4 w-4 text-teal-700" />
                              </div>
                              <p className="text-xs font-bold text-slate-600 italic uppercase">{dose} ({med.apresentacao || 'COMPRIMIDO'})</p>
                            </div>
                            {med.tipo === 'sos' && (
                              <span className="inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                SOS
                              </span>
                            )}
                          </div>
                          
                          {symptomImage && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                              <div className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-[100px] bg-pink-50 border-pink-200 shadow-sm`}>
                                <div className="mb-1 flex items-center justify-center h-16 w-16">
                                  <img src={symptomImage} alt={symptomName} className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                </div>
                                <span className="text-[8px] font-black uppercase text-center leading-tight text-pink-700">PARA {symptomName.toUpperCase()}</span>
                              </div>
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
                          <td key={slot.id} className="border border-slate-300 text-center p-2 align-middle">
                            {isActive ? (
                              <div className="flex flex-col items-center gap-1">
                                <MedicationVisual dose={dose} form={med.apresentacao} />
                                <span className="text-[8px] font-black uppercase text-teal-600 mt-1">{dose}</span>
                              </div>
                            ) : (
                              <div className="h-1.5 bg-slate-100 rounded-full mx-3" />
                            )}
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

        {/* ========== SEÇÃO SOS ========== */}
        {receita.medicamentos_sos && receita.medicamentos_sos.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl border-4 border-dashed border-teal-500 bg-teal-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-teal-500 p-3 text-white shadow-md">
                <History className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-teal-900 uppercase tracking-tight">MEDICAMENTOS SOS</h3>
                <p className="text-sm font-bold text-teal-700 uppercase">TOMAR SOMENTE SE NECESSÁRIO</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {receita.medicamentos_sos.map((sos: any, i: number) => {
                let symptomImage = null;
                let symptomName = sos.indicacao || '';
                if (sos.symptoms && Array.isArray(sos.symptoms) && sos.symptoms.length > 0) {
                  const s = sos.symptoms[0];
                  symptomName = s.name || symptomName;
                  if (s.file) symptomImage = `/img/n/f/${s.file}`;
                }
                if (!symptomImage) symptomImage = getSymptomImage(symptomName);

                return (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-teal-200 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-teal-100 p-3 flex-shrink-0">
                        <IconLoader name="Pill" className="h-6 w-6 text-teal-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-black text-slate-900 leading-tight uppercase">{sos.nome}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">{sos.texto_original_da_posologia}</p>
                      </div>
                    </div>
                    {symptomImage && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-teal-100">
                        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-[90px] bg-pink-50 border-pink-200 shadow-sm`}>
                          <div className="mb-1 flex items-center justify-center h-12 w-12">
                            <img src={symptomImage} alt={symptomName} className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                          <span className="text-[8px] font-black uppercase text-center leading-tight text-pink-700">PARA {symptomName.toUpperCase()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== RODAPÉ / ASSINATURAS ========== */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-12 text-center pt-8 border-t-2 border-slate-100">
          <div className="space-y-4">
            <div className="h-px bg-slate-400 w-full mb-4" />
            <div className="flex flex-col">
              <p className="text-lg font-black text-slate-900 uppercase">{receita.medico || 'NÃO INFORMADO'}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">CRM: {receita.medico_id || 'NÃO INFORMADO'}</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-slate-400">
                <Stethoscope className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">MÉDICO PRESCRITOR</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-px bg-slate-400 w-full mb-4" />
            <div className="flex flex-col">
              <p className="text-lg font-black text-slate-900 uppercase">{receita.farmaceutico || 'PROFISSIONAL FARMACÊUTICO'}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">CRF: {receita.farmaceutico_id || 'NÃO INFORMADO'}</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-slate-400">
                <Pill className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">DISPENSAÇÃO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da instituição no rodapé */}
        {instEndereco && (
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-sm text-gray-600 uppercase">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-teal-700" />
              <span className="font-semibold">{instEndereco}</span>
            </div>
            {instTelefone && (
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 text-teal-700" />
                <span className="font-semibold">{instTelefone}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-[10px] font-mono text-slate-300 uppercase">
          RECEITA FACILITADA • {receita.id}
        </div>
      </div>

      {/* CSS para impressão */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; padding: 0; }
          #prescription-paper { 
            width: 100% !important; 
            max-width: none !important; 
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}
