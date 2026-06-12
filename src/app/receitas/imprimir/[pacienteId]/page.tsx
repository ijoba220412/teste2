'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Printer, ArrowLeft, User, Calendar, FileText, Stethoscope,
  AlertCircle, MapPin, Phone, History, Check,
  Sun, Coffee, Utensils, Sunset, Moon
} from 'lucide-react';

// Interfaces mockadas para substituir as importações locais (@/types)
interface Receita {
  id?: string;
  dataEmissao?: any;
  data_criacao?: any;
  nomePaciente?: string;
  data_nasc?: any;
  prontuario?: string;
  alergias?: string;
  medicamentos_fixos?: any[];
  medicamentos_sos?: any[];
  nomeInstituicao?: string;
  instituicaoId?: string;
  medico?: string;
  medico_id?: string;
  farmaceutico?: string;
  farmaceutico_id?: string;
}

interface Instituicao {
  id?: string;
  nome?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  telefone1?: string;
}

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

// ========== FORMAS FARMACÊUTICAS (APENAS PARA TABELA DE HORÁRIOS) ==========
const ComprimidoIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <circle cx={size/2} cy={size/2} r={size/2 - 3} fill="#0f766e" stroke="#0f766e" strokeWidth="2"/>
    <line x1={size/4 + 2} y1={size - size/4 - 2} x2={size - size/4 - 2} y2={size/4 + 2} stroke="white" strokeWidth="3"/>
  </svg>
);

const CapsulaIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
    <rect x="0" y="0" width={size} height={size * 0.6} rx={size * 0.3} fill="currentColor" stroke="#0f766e" strokeWidth="2" className="text-teal-700"/>
    <path d={`M ${size/2} 0 L ${size/2} ${size * 0.6}`} stroke="#0f766e" strokeWidth="1.5" opacity="0.5"/>
  </svg>
);

const CopoMedidorIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-teal-700">
    <path d="M 5 7 L 19 7 L 17 19 L 7 19 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="7.5" y1="15" x2="16.5" y2="15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const GotaIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-teal-700">
    <path d="M12 2 C12 2 6 10 6 14 C6 17.31 8.69 20 12 20 C15.31 20 18 17.31 18 14 C18 10 12 2 12 2 Z" fill="currentColor" stroke="#0f766e" strokeWidth="1.5"/>
    <ellipse cx="10" cy="13" rx="2" ry="3" fill="white" opacity="0.6"/>
  </svg>
);

const getFormIcon = (form?: string, size: number = 44) => {
  const formLower = form?.toLowerCase() || '';
  if (formLower.includes('capsula') || formLower.includes('cápsula')) return <CapsulaIcon size={size} />;
  if (formLower.includes('xarope') || formLower.includes('líquido') || formLower.includes('liquido') || formLower.includes('solução') || formLower.includes('solucao')) return <CopoMedidorIcon size={size} />;
  if (formLower.includes('gota')) return <GotaIcon size={size} />;
  return <ComprimidoIcon size={size} />;
};

const MedicationVisual = ({ dose, form }: { dose: string; form?: string }) => {
  const doseNum = parseInt(dose) || 1;
  const maxPills = Math.min(doseNum, 4);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: maxPills }).map((_, i) => <div key={i}>{getFormIcon(form, 44)}</div>)}
      {doseNum > 4 && <span className="text-xs font-black text-teal-700 ml-1">+{doseNum - 4}</span>}
    </div>
  );
};

// ========== FUNÇÕES AUXILIARES ==========
function formatDate(dateStr: any): string {
  if (!dateStr) return 'NÃO INFORMADA';
  if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  try {
    const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
    if (!isNaN(date.getTime())) return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  } catch {}
  return 'NÃO INFORMADA';
}

// MAPEAMENTO COMPLETO DE SINTOMAS
function getSymptomImage(symptomName: string | undefined): string | null {
  if (!symptomName) return null;
  const name = symptomName.toLowerCase().trim();
  
  const map: Record<string, string> = {
    'ácido úrico': 'acidourico.png',
    'acido urico': 'acidourico.png',
    'convulsão': 'convulsao.png',
    'convulsao': 'convulsao.png',
    'gases': 'gases.png',
    'salivação': 'salivacao.png',
    'salivacao': 'salivacao.png',
    'tireoide': 'tireoide.png',
    'tratamento hormonal': 'tratamentohormonal.png',
    'agitação': 'agitacao.png',
    'agitacao': 'agitacao.png',
    'anemia': 'anemia.png',
    'ansiedade': 'ansiedade.png',
    'asma': 'asma.png',
    'câncer de mama': 'cancermama.png',
    'cancer de mama': 'cancermama.png',
    'circulação': 'circulacao.png',
    'colesterol': 'colesterol.png',
    'constipação': 'constipacao.png',
    'coração': 'coracao.png',
    'depressão': 'depressao.png',
    'diabetes': 'diabete.png',
    'diarreia': 'diarreia.png',
    'dor de estômago': 'dorestomago.png',
    'dor estômago': 'dorestomago.png',
    'dor intensa': 'dorintensa.png',
    'dor': 'dor.png',
    'fadiga': 'fadiga.png',
    'falta de ar': 'faltaar.png',
    'infecção': 'infeccao.png',
    'insônia': 'insonia.png',
    'insonia': 'insonia.png',
    'nausea': 'nausea.png',
    'náusea': 'nausea.png',
    'enjoo': 'nausea.png',
    'ossos': 'ossos.png',
    'perda de apetite': 'perdaapetite.png',
    'pressão alta': 'pressaoalta.png',
    'proteger estômago': 'protegerestomago.png',
    'pulmão': 'pulmao.png',
    'sono': 'sono.png',
    'tosse': 'tosse.png',
    'trombose': 'trombose.png',
    'vomito': 'vomito.png',
    'vômito': 'vomito.png'
  };
  
  if (map[name]) return `/img/n/f/${map[name]}`;
  
  for (const [key, file] of Object.entries(map)) {
    if (name.includes(key)) return `/img/n/f/${file}`;
  }
  return null;
}

// ========== COMPONENTE PRINCIPAL ==========
export default function ImprimirReceita() {
  // Mock das rotas do Next.js para rodar no Preview
  const router = { push: (path: string) => console.log('Voltando para:', path) };
  const printRef = useRef<HTMLDivElement>(null);
  
  const [receita, setReceita] = useState<Receita | null>(null);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AÇÃO DIRETA SEM SETTIMEOUT PARA EVITAR BLOQUEIO DO NAVEGADOR
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Mock do Firebase para visualização de layout no ambiente de preview
    const loadMockData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // simula delay de rede
        
        const mockReceita: Receita = {
          id: 'REC-9999',
          dataEmissao: new Date().toISOString(),
          nomePaciente: 'João da Silva',
          data_nasc: '15/04/1980',
          prontuario: '48291-B',
          alergias: 'Penicilina, Frutos do Mar',
          nomeInstituicao: 'Clínica Saúde Total',
          medico: 'Dr. Carlos Mendes',
          medico_id: '123456-SP',
          farmaceutico: 'Ana Souza',
          farmaceutico_id: '654321-SP',
          medicamentos_fixos: [
            {
              nome: 'Losartana Potássica',
              apresentacao: 'Comprimido',
              texto_original_da_posologia: '1 comprimido de manhã',
              indicacao: 'Pressão Alta',
              horarios: ['08:00']
            },
            {
              nome: 'Metformina',
              apresentacao: 'Comprimido',
              texto_original_da_posologia: '1 comprimido após almoço e jantar',
              indicacao: 'Diabetes',
              horarios: ['12:00', '20:00']
            }
          ],
          medicamentos_sos: [
            {
              nome: 'Dipirona Sódica',
              apresentacao: 'Gotas',
              texto_original_da_posologia: '40 gotas de 6 em 6 horas',
              indicacao: 'Dor Intensa'
            }
          ]
        };

        const mockInstituicao: Instituicao = {
          id: 'inst-1',
          nome: 'Clínica Saúde Total',
          rua: 'Av. Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          uf: 'SP',
          telefone1: '(11) 99999-9999'
        };

        setReceita(mockReceita);
        setInstituicao(mockInstituicao);
      } catch {
        setError('ERRO AO CARREGAR OS DADOS MOCKADOS');
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-700 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">CARREGANDO...</p>
      </div>
    </div>
  );

  if (error || !receita) return (
    <div className="min-h-screen bg-gray-100 p-8 text-center">
      <div className="max-w-md mx-auto bg-white border-2 border-red-300 rounded-2xl p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-bold">{error || 'ERRO'}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 bg-teal-700 text-white px-6 py-3 rounded-xl">VOLTAR</button>
      </div>
    </div>
  );

  const fixed = receita.medicamentos_fixos || [];
  const sos = receita.medicamentos_sos || [];
  const instNome = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO';
  const instEnd = instituicao ? `${instituicao.rua || ''}, ${instituicao.numero || ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''}` : '';
  const instTel = instituicao?.telefone1 || '';

  return (
    <div className="min-h-screen bg-gray-100 pb-10 print:bg-white print:pb-0">
      
      {/* CSS DE IMPRESSÃO - INJETADO DE FORMA SEGURA PARA REACT */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Define o tamanho da página como A4 e paisagem (landscape) e margens seguras */
          @page { size: A4 landscape; margin: 10mm; }
          
          body, html {
            background-color: white !important;
            margin: 0;
            padding: 0;
            /* Força os navegadores a imprimirem as cores de fundo */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Oculta os botões na hora da impressão */
          .no-print, .print\\:hidden { display: none !important; }
          
          #prescription-paper { 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            box-shadow: none !important; 
            border: none !important;
          }
          
          /* Evita que linhas da tabela ou células sejam cortadas pela metade entre páginas */
          table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          td, th { page-break-inside: avoid; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}} />

      {/* BARRA DE AÇÕES (ESCONDIDA NA IMPRESSÃO) */}
      <div className="no-print print:hidden bg-white shadow p-4 flex justify-between sticky top-0 z-50">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-700 font-semibold px-4 py-2 rounded-xl transition hover:bg-gray-50">
          <ArrowLeft className="h-5 w-5" /> VOLTAR
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition hover:bg-teal-800 active:scale-95">
          <Printer className="h-5 w-5" /> IMPRIMIR / PDF
        </button>
      </div>

      <div ref={printRef} id="prescription-paper" className="max-w-7xl mx-auto mt-6 bg-white p-8 sm:p-10 shadow-xl">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-4 border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-900 p-3">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase">RECEITA MÉDICA FACILITADA</h1>
              <p className="text-sm font-bold text-slate-500 uppercase">{instNome}</p>
            </div>
          </div>
          <div className="text-right mt-4 sm:mt-0">
            <p className="text-sm font-bold text-slate-400 uppercase">DATA DE EMISSÃO</p>
            <p className="text-xl font-black">{formatDate(receita.dataEmissao || receita.data_criacao)}</p>
          </div>
        </div>

        {/* DADOS DO PACIENTE */}
        <div className="mb-10 grid md:grid-cols-2 gap-6 rounded-2xl bg-slate-50 p-6 border border-slate-200 print:bg-slate-50 print:border-slate-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 border border-slate-100">
                <User className="h-6 w-6 text-teal-700" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400">PACIENTE</p>
                <p className="text-xl font-black uppercase">{receita.nomePaciente || 'NÃO INFORMADO'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 border border-slate-100">
                <Calendar className="h-6 w-6 text-teal-700" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400">NASCIMENTO</p>
                <p className="text-xl font-black">{formatDate(receita.data_nasc)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 border border-slate-100">
                <FileText className="h-6 w-6 text-teal-700" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400">PRONTUÁRIO</p>
                <p className="text-xl font-black">{receita.prontuario || 'NÃO INFORMADO'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {receita.alergias && receita.alergias.trim() !== '' ? (
              <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 w-full h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertCircle className="h-6 w-6" />
                  <p className="text-sm font-black">ATENÇÃO: ALERGIAS</p>
                </div>
                <p className="text-xl font-black text-red-700 uppercase">{receita.alergias}</p>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4 w-full h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Check className="h-6 w-6" />
                  <p className="text-sm font-black">ALERGIAS</p>
                </div>
                <p className="text-xl font-black text-green-700 uppercase">NEGA ALERGIAS</p>
              </div>
            )}
          </div>
        </div>

        {/* TABELA DE MEDICAMENTOS FIXOS */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full border-collapse border-b-4 border-slate-900 print:border-slate-900">
            <thead>
              <tr className="bg-slate-900 text-white print:bg-slate-900 print:text-white">
                <th className="border border-slate-900 print:border-slate-900 p-3 text-left min-w-[350px]">MEDICAMENTO E MOTIVO</th>
                {SCHEDULE_SLOTS.map(slot => { 
                  const Icon = slot.icon; 
                  return (
                    <th key={slot.id} className="border border-slate-900 print:border-slate-900 p-2 text-center min-w-[120px]">
                      <div className="flex flex-col items-center">
                        <Icon className="h-8 w-8 mb-1" />
                        <span className="text-xs font-black">{slot.label}</span>
                        <span className="text-xs opacity-50">{slot.time}</span>
                      </div>
                    </th>
                  ); 
                })}
              </tr>
            </thead>
            <tbody>
              {fixed.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-300 print:border-slate-900 p-8 text-center font-bold text-slate-500">
                    NENHUM MEDICAMENTO DE USO CONTÍNUO
                  </td>
                </tr>
              ) : fixed.map((med, idx) => {
                const dose = med.texto_original_da_posologia?.split(' ')[0] || '1';
                let symptoms: {image: string|null, name: string}[] = [];
                
                if (med.symptoms && Array.isArray(med.symptoms)) {
                  med.symptoms.forEach((s: any) => { 
                    let img = s.file ? `/img/n/f/${s.file}` : (s.id ? `/img/n/f/${s.id}.png` : getSymptomImage(s.name || med.indicacao)); 
                    symptoms.push({image: img, name: s.name || med.indicacao || ''}); 
                  });
                } else if (med.indicacao) {
                  symptoms.push({image: getSymptomImage(med.indicacao), name: med.indicacao});
                }
                
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50 print:bg-slate-50'}>
                    <td className="border border-slate-300 print:border-slate-900 p-4 align-top">
                      <div>
                        <p className="text-xl font-black uppercase mb-2">{med.nome}</p>
                        <p className="text-sm font-bold italic uppercase">{dose} {med.apresentacao || 'COMPRIMIDO'}</p>
                      </div>
                      
                      {symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-200 mt-3">
                          {symptoms.map((sym,si)=> 
                            <div key={si} className="flex flex-col items-center p-2 rounded-xl border-2 min-w-[140px] bg-pink-50 border-pink-200 print:bg-pink-50 print:border-pink-200">
                              <div className="h-32 w-32 flex items-center justify-center mb-2">
                                {sym.image ? (
                                  <img 
                                    src={sym.image} 
                                    alt={sym.name} 
                                    className="max-h-full max-w-full object-contain" 
                                    onError={(e)=>{
                                      e.currentTarget.style.display='none'; 
                                      if(e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML='<span style="font-size: 4.5rem; line-height: 1;">❓</span>';
                                    }} 
                                  />
                                ) : (
                                  <span className="text-7xl">❓</span>
                                )}
                              </div>
                              <span className="text-base font-black text-center text-pink-700 uppercase px-1">PARA {sym.name.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    {SCHEDULE_SLOTS.map(slot => { 
                      const active = med.horarios?.some((h:string) => { 
                        const hour = parseInt(h.split(':')[0]); 
                        if(slot.id==='madrugada') return hour>=0 && hour<6; 
                        if(slot.id==='acordar') return hour>=6 && hour<7; 
                        if(slot.id==='cafe') return hour>=7 && hour<11; 
                        if(slot.id==='almoco') return hour>=11 && hour<14; 
                        if(slot.id==='tarde') return hour>=14 && hour<17; 
                        if(slot.id==='fim_tarde') return hour>=17 && hour<19; 
                        if(slot.id==='jantar') return hour>=19 && hour<21; 
                        if(slot.id==='dormir') return hour>=21; 
                        return false; 
                      }); 
                      return (
                        <td key={slot.id} className="border border-slate-300 print:border-slate-900 p-3 text-center align-middle">
                          {active ? <MedicationVisual dose={dose} form={med.apresentacao} /> : <div className="h-2 bg-slate-200 print:bg-slate-200 rounded-full mx-2" />}
                        </td>
                      ); 
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SEÇÃO SOS - ÍCONES GRANDES */}
        {sos.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl border-4 border-dashed border-teal-500 bg-teal-50 print:bg-teal-50 print:border-teal-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-teal-500 p-3">
                <History className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-teal-900">MEDICAMENTOS SOS</h3>
                <p className="text-base font-bold text-teal-700">TOMAR SOMENTE SE NECESSÁRIO</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sos.map((item,i)=>{ 
                let sList:any[] = []; 
                if(item.symptoms) {
                  item.symptoms.forEach((s:any)=>{ 
                    let img = s.file ? `/img/n/f/${s.file}` : (s.id ? `/img/n/f/${s.id}.png` : getSymptomImage(s.name||item.indicacao)); 
                    sList.push({image: img, name: s.name||item.indicacao||''}); 
                  }); 
                }
                else if(item.indicacao) {
                  sList.push({image: getSymptomImage(item.indicacao), name: item.indicacao}); 
                }
                
                return (
                  <div key={i} className="bg-white p-4 rounded-xl shadow border border-teal-200 print:border-teal-300 print:shadow-none">
                    <div>
                      <p className="text-xl font-black uppercase">{item.nome}</p>
                      <p className="text-sm font-bold uppercase">{item.texto_original_da_posologia}</p>
                    </div>
                    {sList.length>0 && (
                      <div className="flex flex-wrap gap-3 pt-3 border-t mt-2 border-slate-100">
                        {sList.map((sym,si)=> 
                          <div key={si} className="flex flex-col items-center p-2 rounded-xl border-2 min-w-[110px] bg-pink-50 border-pink-200 print:bg-pink-50 print:border-pink-200">
                            <div className="h-24 w-24 flex items-center justify-center mb-1">
                              {sym.image ? (
                                <img 
                                  src={sym.image} 
                                  alt={sym.name} 
                                  className="max-h-full max-w-full object-contain" 
                                  onError={(e)=>{
                                    e.currentTarget.style.display='none'; 
                                    if(e.currentTarget.parentElement) e.currentTarget.parentElement.innerHTML='<span style="font-size: 3rem; line-height: 1;">❓</span>';
                                  }} 
                                />
                              ) : (
                                <span className="text-5xl">❓</span>
                              )}
                            </div>
                            <span className="text-sm font-black text-center text-pink-700 uppercase">PARA {sym.name.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ASSINATURAS E RODAPÉ */}
        <div className="mt-16 grid sm:grid-cols-2 gap-12 text-center pt-8 border-t-2 border-slate-200 print:border-slate-300">
          <div>
            <p className="text-xl font-black uppercase">{receita.medico || 'NÃO INFORMADO'}</p>
            <p className="text-sm font-bold uppercase">CRM: {receita.medico_id || 'NÃO INFORMADO'}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-slate-400">
              <Stethoscope className="h-5 w-5" />
              <span className="text-xs font-bold">MÉDICO PRESCRITOR</span>
            </div>
          </div>
          <div>
            <p className="text-xl font-black uppercase">{receita.farmaceutico || 'PROFISSIONAL FARMACÊUTICO'}</p>
            <p className="text-sm font-bold uppercase">CRF: {receita.farmaceutico_id || 'NÃO INFORMADO'}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-slate-400">
              <Stethoscope className="h-5 w-5" />
              <span className="text-xs font-bold">DISPENSAÇÃO</span>
            </div>
          </div>
        </div>

        {instEnd && (
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-sm print:border-slate-300">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-teal-700" />
              <span>{instEnd}</span>
            </div>
            {instTel && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-teal-700" />
                <span>{instTel}</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-8 text-center text-xs font-mono text-slate-300 uppercase">
          RECEITA FACILITADA • {receita.id}
        </div>
      </div>
    </div>
  );
}
