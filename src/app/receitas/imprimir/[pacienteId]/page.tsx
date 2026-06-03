'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita, Instituicao } from '@/types';
import { Printer, ArrowLeft, AlertCircle, MapPin, Phone, User, Stethoscope, Pill } from 'lucide-react';

// ============================================================================
// COMPONENTE VISUAL: COMPRIMIDO (Ø) vs CÁPSULA (Oval)
// ============================================================================
function MedicamentoVisual({ 
  dose, 
  apresentacao 
}: { 
  dose: string | number; 
  apresentacao?: string;
}) {
  // Verifica se é cápsula ou comprimido baseado no campo 'apresentacao'
  const isCapsula = apresentacao?.toLowerCase().includes('capsula') || 
                    apresentacao?.toLowerCase().includes('cápsula');
  
  // Converte dose para número (ex: "1", "0.5", "2")
  const doseNum = parseFloat(String(dose).replace(',', '.'));
  const parteInteira = Math.floor(doseNum);
  const temFracao = doseNum % 1 !== 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {/* Renderiza a quantidade inteira */}
      {Array.from({ length: parteInteira }).map((_, i) => (
        isCapsula ? (
          // CÁPSULA: Formato Oval (Lozenge)
          <svg key={i} width="24" height="14" viewBox="0 0 24 14" className="text-teal-700">
            <rect x="0" y="0" width="24" height="14" rx="7" fill="currentColor" stroke="#0f766e" strokeWidth="1"/>
            {/* Detalhe para parecer cápsula de 2 cores */}
            <path d="M 12 0 L 12 14" stroke="#0f766e" strokeWidth="1" opacity="0.5"/>
          </svg>
        ) : (
          // COMPRIMIDO: Círculo com linha diagonal (Ø) conforme seu esboço
          <svg key={i} width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#0f766e" strokeWidth="2"/>
            <line x1="4" y1="16" x2="16" y2="4" stroke="#0f766e" strokeWidth="2"/>
          </svg>
        )
      ))}
      
      {/* Se tiver fração (ex: 0.5 ou 1.5) */}
      {temFracao && (
        isCapsula ? (
          // CÁPSULA FRACIONADA = ERRO (Cápsulas não podem ser partidas)
          <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
            <AlertCircle size={12} /> INVÁLIDO
          </div>
        ) : (
          // MEIO COMPRIMIDO: Círculo com linha diagonal (representa a parte fracionada)
          <svg key="half" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#0f766e" strokeWidth="2"/>
            <line x1="4" y1="16" x2="16" y2="4" stroke="#ef4444" strokeWidth="2"/> {/* Linha vermelha para destacar fração */}
          </svg>
        )
      )}
    </div>
  );
}

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

// Extrai os horários únicos ordenados de todos os medicamentos
function getUniqueTimeSlots(medicamentos: any[]): string[] {
  const allHours: string[] = [];
  medicamentos.forEach(med => {
    if (med.horarios && Array.isArray(med.horarios)) {
      med.horarios.forEach((h: string) => {
        if (!allHours.includes(h)) allHours.push(h);
      });
    }
  });
  return allHours.sort();
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ImprimirReceita() {
  const params = useParams();
  const router = useRouter();
  const receitaId = params?.pacienteId as string;
  
  const [receita, setReceita] = useState<Receita | null>(null);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO RECEITA...</p>
        </div>
      </div>
    );
  }

  if (error || !receita) {
    return (
      <div className="min-h-screen bg-white p-8 text-center">
        <div className="max-w-md mx-auto border-2 border-red-300 rounded-2xl p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-700 uppercase mb-4">{error || 'RECEITA NÃO ENCONTRADA'}</p>
          <button onClick={() => router.push('/dashboard')} className="bg-teal-700 text-white px-6 py-3 rounded-xl uppercase font-semibold">
            VOLTAR
          </button>
        </div>
      </div>
    );
  }

  const allItems = [...(receita.medicamentos_fixos || []), ...(receita.medicamentos_sos || [])];
  const timeSlots = getUniqueTimeSlots(allItems);

  const instNome = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO';
  const instEndereco = instituicao ? `${instituicao.rua || ''}, ${instituicao.numero || ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''} - CEP: ${instituicao.cep || ''}` : '';
  const instTelefone = instituicao?.telefone1 || '';

  return (
    <div className="min-h-screen bg-gray-100 pb-10 print:bg-white print:pb-0">
      
      {/* BOTÕES DE AÇÃO */}
      <div className="bg-white shadow p-4 flex justify-between items-center print:hidden sticky top-0 z-50">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-700 font-semibold uppercase">
          <ArrowLeft size={20} /> VOLTAR
        </button>
        <button onClick={() => window.print()} className="bg-teal-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 uppercase">
          <Printer size={20} /> IMPRIMIR / PDF
        </button>
      </div>

      {/* FOLHA DA RECEITA */}
      <div className="max-w-4xl mx-auto mt-6 bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:mt-0">
        
        {/* ========== CABEÇALHO ========== */}
        <header className="border-b-4 border-teal-700 p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-teal-800 uppercase tracking-wider">{instNome}</h1>
            {instituicao?.descricao && <p className="text-sm text-gray-600 uppercase mt-1">{instituicao.descricao}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-2 border-gray-300 rounded-xl p-4">
            <div>
              <p><span className="font-bold uppercase">Paciente:</span> <span className="font-black uppercase">{receita.nomePaciente || 'NÃO INFORMADO'}</span></p>
              <p><span className="font-bold uppercase">Nascimento:</span> <span className="uppercase">{formatDate(receita.data_nasc)}</span></p>
            </div>
            <div>
              <p><span className="font-bold uppercase">Matrícula:</span> <span className="uppercase">{receita.prontuario || 'NÃO INFORMADO'}</span></p>
              <p><span className="font-bold uppercase">Gênero:</span> <span className="uppercase">NÃO INFORMADO</span></p>
            </div>
            <div>
              <p><span className="font-bold uppercase">Data da Prescrição:</span> <span className="uppercase">{formatDate(receita.dataEmissao || receita.data_criacao)}</span></p>
            </div>
            <div>
              <span className="font-bold uppercase">Alergias:</span>{' '}
              {receita.alergias && receita.alergias.trim() !== '' ? (
                <span className="font-black text-red-700 uppercase bg-red-100 px-2 py-1 rounded">{receita.alergias.toUpperCase()}</span>
              ) : (
                <span className="font-bold text-green-700 uppercase bg-green-100 px-2 py-1 rounded">NEGA ALERGIAS</span>
              )}
            </div>
          </div>
        </header>

        {/* ========== TABELA DE MEDICAMENTOS ========== */}
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-gray-800">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="border-2 border-gray-800 p-3 text-left uppercase font-bold text-sm min-w-[200px]">
                    Medicamento
                  </th>
                  {timeSlots.map((hora, i) => (
                    <th key={i} className="border-2 border-gray-800 p-3 text-center uppercase font-bold text-sm min-w-[80px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{hora}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allItems.length === 0 ? (
                  <tr>
                    <td colSpan={timeSlots.length + 1} className="border-2 border-gray-800 p-8 text-center text-gray-500 uppercase font-semibold">
                      NENHUM MEDICAMENTO PRESCRITO
                    </td>
                  </tr>
                ) : (
                  allItems.map((med: any, index) => {
                    const dose = med.texto_original_da_posologia?.split(' ')[0] || '1';
                    const doseNum = parseFloat(String(dose).replace(',', '.')) || 1;
                    
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
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {/* COLUNA DO MEDICAMENTO */}
                        <td className="border-2 border-gray-800 p-3">
                          <div className="flex items-start gap-3">
                            {/* Imagem do sintoma */}
                            <div className="w-20 shrink-0 border-2 border-pink-200 rounded-lg p-1 bg-pink-50">
                              <div className="h-16 flex items-center justify-center">
                                {symptomImage ? (
                                  <img 
                                    src={symptomImage}
                                    alt={symptomName}
                                    className="h-full w-auto object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : (
                                  <span className="text-2xl text-gray-400"></span>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-pink-700 uppercase text-center leading-tight mt-1">
                                {symptomName ? `PARA ${symptomName.toUpperCase()}` : ''}
                              </p>
                            </div>
                            
                            {/* Nome e dose */}
                            <div className="flex-1">
                              <p className="font-black text-gray-900 uppercase text-base leading-tight">
                                {med.nome || 'MEDICAMENTO'}
                              </p>
                              <p className="text-sm text-teal-700 font-bold uppercase mt-1">
                                {dose.toUpperCase()} • {med.apresentacao || 'comprimido'}
                              </p>
                              {med.tipo && (
                                <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-2 ${
                                  med.tipo === 'sos' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {med.tipo === 'sos' ? 'SOS' : 'USO CONTÍNUO'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* COLUNAS DE HORÁRIO */}
                        {timeSlots.map((hora, i) => {
                          const isActive = med.horarios?.some((h: string) => h === hora);
                          return (
                            <td key={i} className="border-2 border-gray-800 p-2 text-center align-middle h-24">
                              {isActive && (
                                <MedicamentoVisual 
                                  dose={doseNum} 
                                  apresentacao={med.apresentacao} 
                                />
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
        </div>

        {/* ========== RODAPÉ ========== */}
        <footer className="border-t-4 border-teal-700 p-8 bg-gray-50 print:bg-white">
          <div className="mb-6 text-sm text-gray-700 uppercase border-b border-gray-300 pb-4">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-teal-700" />
              <span className="font-semibold">{instEndereco.toUpperCase()}</span>
            </div>
            {instTelefone && (
              <div className="flex items-center gap-2 mt-1">
                <Phone size={14} className="text-teal-700" />
                <span className="font-semibold">{instTelefone}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-12 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-gray-600">
                <Stethoscope size={14} />
                <span className="text-xs font-bold uppercase">Médico Responsável</span>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 mx-4">
                <p className="font-black text-gray-900 uppercase text-sm">{receita.medico || 'NÃO INFORMADO'}</p>
                <p className="text-xs text-gray-600 uppercase">{receita.medico_id || 'CRM/UF'}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-gray-600">
                <Pill size={14} />
                <span className="text-xs font-bold uppercase">Farmacêutico Responsável</span>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 mx-4">
                <p className="font-black text-gray-900 uppercase text-sm">{receita.farmaceutico || 'NÃO INFORMADO'}</p>
                <p className="text-xs text-gray-600 uppercase">{receita.farmaceutico_id || 'CRF/UF'}</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 uppercase text-center mt-8 font-semibold">
            RECEITA FACILITADA • DOCUMENTO GERADO ELETRONICAMENTE EM {new Date().toLocaleDateString('pt-BR')}
          </p>
        </footer>
      </div>

      <style jsx>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}
