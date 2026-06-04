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
// COMPONENTES VISUAIS DAS FORMAS FARMACÊUTICAS - TAMANHO MAIOR (40px)
// ============================================================================

const ComprimidoIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="print:scale-110">
    <circle cx={size/2} cy={size/2} r={size/2 - 3} fill="#0f766e" stroke="#0f766e" strokeWidth="2"/>
    <line x1={size/4 + 3} y1={size - size/4 - 3} x2={size - size/4 - 3} y2={size/4 + 3} stroke="white" strokeWidth="3"/>
  </svg>
);

const CapsulaIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`} className="print:scale-110">
    <rect x="0" y="0" width={size} height={size * 0.6} rx={size * 0.3} fill="currentColor" stroke="#0f766e" strokeWidth="2" className="text-teal-700"/>
    <path d={`M ${size/2} 0 L ${size/2} ${size * 0.6}`} stroke="#0f766e" strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

const CopoMedidorIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="text-teal-700 print:scale-110">
    <path d="M 8 12 L 32 12 L 28 34 L 12 34 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="13" y1="18" x2="27" y2="18" stroke="currentColor" strokeWidth="2"/>
    <line x1="12" y1="25" x2="28" y2="25" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="21" r="2" fill="currentColor"/>
    <circle cx="22" cy="21" r="2" fill="currentColor"/>
  </svg>
);

const GotaIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="text-teal-700 print:scale-110">
    <path d="M20 4 C20 4 8 20 8 26 C8 32.63 13.37 38 20 38 C26.63 38 32 32.63 32 26 C32 20 20 4 20 4 Z" 
          fill="currentColor" stroke="#0f766e" strokeWidth="2"/>
    <ellipse cx="17" cy="24" rx="3" ry="4" fill="white" opacity="0.7"/>
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
  } else {
    return <ComprimidoIcon size={size} />;
  }
};

const MedicationVisual = ({ dose, form }: { dose: string, form?: string }) => {
  const doseNum = parseInt(dose) || 1;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: Math.min(doseNum, 5) }).map((_, i) => (
        <div key={i} className="flex items-center justify-center print:scale-125">
          {getFormIcon(form, 40)}
        </div>
      ))}
    </div>
  );
};

const MedicationTypeIcon = ({ form }: { form?: string }) => {
  return getFormIcon(form, 28);
};

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
      return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
    }
  } catch {}
  return 'NÃO INFORMADA';
}

// ✅ MAPEAMENTO COMPLETO E ATUALIZADO - TIREOIDE E TRATAMENTO HORMONAL SEPARADOS
function getSymptomImage(symptomName: string | undefined): string | null {
  if (!symptomName) return null;
  const name = symptomName.toLowerCase().trim();
  
  const symptomMap: Record<string, string> = {
    // DOR
    'dor': 'dor.png',
    'dor leve': 'dor.png',
    'dor intensa': 'dorintensa.png',
    
    // SONO/DORMIR
    'sono': 'sono.png',
    'dormir': 'sono.png',
    'para dormir': 'sono.png',
    'insônia': 'insonia.png',
    'insonia': 'insonia.png',
    
    // PRESSÃO/CORAÇÃO/CIRCULAÇÃO
    'pressão alta': 'pressaoalta.png',
    'pressao alta': 'pressaoalta.png',
    'pressão': 'pressaoalta.png',
    'coração': 'coracao.png',
    'coracao': 'coracao.png',
    'circulação': 'circulacao.png',
    'circulacao': 'circulacao.png',
    'trombose': 'trombose.png',
    
    // ESTÔMAGO/DIGESTÃO
    'estômago': 'dorestomago.png',
    'estomago': 'dorestomago.png',
    'proteger estômago': 'protegerestomago.png',
    'protegerestomago': 'protegerestomago.png',
    'enjoo': 'nausea.png',
    'enjôo': 'nausea.png',
    'náusea': 'nausea.png',
    'nausea': 'nausea.png',
    'vômito': 'vomito.png',
    'vomito': 'vomito.png',
    'diarreia': 'diarreia.png',
    'prisão de ventre': 'constipacao.png',
    'constipação': 'constipacao.png',
    'constipacao': 'constipacao.png',
    'gases': 'gases.png',
    
    // PULMÃO/RESPIRAÇÃO
    'pulmão': 'pulmao.png',
    'pulmao': 'pulmao.png',
    'asma': 'asma.png',
    'tosse': 'tosse.png',
    'falta de ar': 'faltaar.png',
    'faltaar': 'faltaar.png',
    
    // INFECÇÃO/IMUNOLÓGICO
    'infecção': 'infeccao.png',
    'infeccao': 'infeccao.png',
    'antibiótico': 'infeccao.png',
    'antibiotico': 'infeccao.png',
    
    // SAÚDE MENTAL
    'ansiedade': 'ansiedade.png',
    'depressão': 'depressao.png',
    'depressao': 'depressao.png',
    'tristeza': 'depressao.png',
    'agitação': 'agitacao.png',
    'agitacao': 'agitacao.png',
    'agitaçao': 'agitacao.png',
    
    // METABÓLICO/ENDÓCRINO - SEPARADOS CORRETAMENTE
    'diabetes': 'diabete.png',
    'diabete': 'diabete.png',
    'colesterol': 'colesterol.png',
    'tireoide': 'tireoide.png',
    'tireóide': 'tireoide.png',
    'tratamento hormonal': 'tratamentohormonal.png',
    'tratamentohormonal': 'tratamentohormonal.png',
    'ácido úrico': 'acidourico.png',
    'acido urico': 'acidourico.png',
    
    // SANGUE/ANEMIA
    'anemia': 'anemia.png',
    'sangramento': 'anemia.png',
    'sangue': 'anemia.png',
    
    // OSSOS/CÁLCIO
    'ossos': 'ossos.png',
    'osso': 'ossos.png',
    'cálcio': 'ossos.png',
    'calcio': 'ossos.png',
    
    // OUTROS
    'fadiga': 'fadiga.png',
    'cansaço': 'fadiga.png',
    'cansaco': 'fadiga.png',
    'apetite': 'perdaapetite.png',
    'perda de apetite': 'perdaapetite.png',
    'perdaapetite': 'perdaapetite.png',
    'câncer': 'cancermama.png',
    'cancer': 'cancermama.png',
    'câncer de mama': 'cancermama.png',
    'convulsão': 'convulsao.png',
    'convulsao': 'convulsao.png',
    'salivação': 'salivacao.png',
    'salivacao': 'salivacao.png',
    'salivação excessiva': 'salivacao.png',
  };
  
  // Busca exata primeiro
  if (symptomMap[name]) return `/img/n/f/${symptomMap[name]}`;
  
  // Busca parcial
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

  const handlePrint = () => {
    window.print();
  };

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

  const continuousMeds = (receita.medicamentos_fixos || []).filter((m: any) => !m.tipo || m.tipo === 'continuo');
  const sosMeds = (receita.medicamentos_sos || []).filter((m: any) => m.tipo === 'sos');
  
  const instNome = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO';
  const instEndereco = instituicao ? `${instituicao.rua || ''}, ${instituicao.numero || ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''} - CEP: ${instituicao.cep || ''}` : '';
  const instTelefone = instituicao?.telefone1 || '';

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-700 font-semibold uppercase hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5" /> VOLTAR
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg">
          <Printer className="h-5 w-5" /> IMPRIMIR / PDF
        </button>
      </div>

      <div ref={printRef} id="prescription-paper" className="max-w-4xl mx-auto mt-6 bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:mt-0 print:p-0 print:w-full print:max-w-none">
        
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-6 mb-8 text-center sm:text-left gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Stethoscope className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 print:text-3xl">RECEITA MÉDICA FACILITADA</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{instNome}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm font-bold text-slate-400 uppercase">DATA DE EMISSÃO</p>
            <p className="text-lg font-black text-slate-900">{formatDate(receita.dataEmissao || receita.data_criacao)}</p>
          </div>
        </div>

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

        {continuousMeds.length > 0 && (
          <div className="mb-10 overflow-x-auto">
            <table className="w-full border-collapse border-b-2 border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="border border-slate-900 p-3 text-sm font-black uppercase leading-tight min-w-[220px] text-left">
                    MEDICAMENTO E MOTIVO
                  </th>
                  {SCHEDULE_SLOTS.map(slot => {
                    const Icon = slot.icon;
                    return (
                      <th key={slot.id} className="border border-slate-900 p-2 text-center min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <Icon className="h-6 w-6 mb-1" />
                          <span className="text-[8px] font-black uppercase leading-tight">{slot.label}</span>
                          <span className="text-[10px] font-black opacity-50 mt-1">{slot.time}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {continuousMeds.map((med: any, idx) => {
                  const dose = med.texto_original_da_posologia?.split(' ')[0] || '1';
                  
                  const symptomsList: Array<{ image: string | null; name: string }> = [];
                  
                  if (med.symptoms && Array.isArray(med.symptoms) && med.symptoms.length > 0) {
                    med.symptoms.forEach((s: any) => {
                      let img: string | null = null;
                      let sName = s.name || med.indicacao || '';
                      if (s.file) img = `/img/n/f/${s.file}`;
                      else if (s.id) img = `/img/n/f/${s.id}.png`;
                      if (!img) img = getSymptomImage(sName);
                      symptomsList.push({ image: img, name: sName });
                    });
                  } else if (med.indicacao) {
                    const img = getSymptomImage(med.indicacao);
                    symptomsList.push({ image: img, name: med.indicacao });
                  }
                  
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-4">
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="text-lg font-black text-slate-900 uppercase leading-none mb-1">{med.nome || 'MEDICAMENTO'}</p>
                            <div className="flex items-center gap-2">
                              <div className="rounded bg-teal-100 p-2 flex items-center justify-center">
                                <MedicationTypeIcon form={med.apresentacao} />
                              </div>
                              <p className="text-xs font-bold text-slate-600 italic uppercase">{dose} ({med.apresentacao || 'COMPRIMIDO'})</p>
                            </div>
                          </div>
                          
                          {symptomsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                              {symptomsList.map((symptom, sIdx) => (
                                <div key={sIdx} className="flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-[100px] bg-pink-50 border-pink-200 shadow-sm">
                                  <div className="mb-1 flex items-center justify-center h-16 w-16">
                                    {symptom.image ? (
                                      <img 
                                        src={symptom.image} 
                                        alt={symptom.name} 
                                        className="max-h-full max-w-full object-contain" 
                                        onError={(e) => { 
                                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                                          if ((e.currentTarget as HTMLImageElement).parentElement) {
                                            (e.currentTarget as HTMLImageElement).parentElement!.innerHTML = '<span class="text-3xl text-gray-400">❓</span>';
                                          }
                                        }} 
                                      />
                                    ) : (
                                      <span className="text-3xl text-gray-400">❓</span>
                                    )}
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-center leading-tight text-pink-700 break-words px-1">
                                    PARA {symptom.name.toUpperCase()}
                                  </span>
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
                })}
              </tbody>
            </table>
          </div>
        )}

        {sosMeds.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl border-4 border-dashed border-teal-500 bg-teal-50 print:border-2 print:border-teal-600">
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
              {sosMeds.map((sos: any, i: number) => {
                const symptomsList: Array<{ image: string | null; name: string }> = [];
                
                if (sos.symptoms && Array.isArray(sos.symptoms) && sos.symptoms.length > 0) {
                  sos.symptoms.forEach((s: any) => {
                    let img: string | null = null;
                    let sName = s.name || sos.indicacao || '';
                    if (s.file) img = `/img/n/f/${s.file}`;
                    else if (s.id) img = `/img/n/f/${s.id}.png`;
                    if (!img) img = getSymptomImage(sName);
                    symptomsList.push({ image: img, name: sName });
                  });
                } else if (sos.indicacao) {
                  const img = getSymptomImage(sos.indicacao);
                  symptomsList.push({ image: img, name: sos.indicacao });
                }

                return (
                  <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-teal-200 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-teal-100 p-3 flex-shrink-0 flex items-center justify-center">
                        <MedicationTypeIcon form={sos.apresentacao} />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-black text-slate-900 leading-tight uppercase">{sos.nome}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">{sos.texto_original_da_posologia}</p>
                      </div>
                    </div>
                    {symptomsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-teal-100">
                        {symptomsList.map((symptom, sIdx) => (
                          <div key={sIdx} className="flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-[90px] bg-pink-50 border-pink-200 shadow-sm">
                            <div className="mb-1 flex items-center justify-center h-12 w-12">
                              {symptom.image ? (
                                <img 
                                  src={symptom.image} 
                                  alt={symptom.name} 
                                  className="max-h-full max-w-full object-contain" 
                                  onError={(e) => { 
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    if ((e.currentTarget as HTMLImageElement).parentElement) {
                                      (e.currentTarget as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl text-gray-400">❓</span>';
                                    }
                                  }} 
                                />
                              ) : (
                                <span className="text-2xl text-gray-400">❓</span>
                              )}
                            </div>
                            <span className="text-[8px] font-black uppercase text-center leading-tight text-pink-700 break-words px-1">
                              PARA {symptom.name.toUpperCase()}
                            </span>
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
                <Stethoscope className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">DISPENSAÇÃO</span>
              </div>
            </div>
          </div>
        </div>

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

      <style jsx global>{`
        @media print {
          @page { 
            margin: 1cm; 
            size: A4;
          }
          
          body { 
            background: white !important; 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          #prescription-paper {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .bg-teal-50, .bg-pink-50, .bg-green-50, .bg-red-50, .bg-amber-50 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .border-teal-500, .border-pink-200, .border-green-500, .border-red-500 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .text-teal-700, .text-pink-700, .text-green-700, .text-red-700 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
