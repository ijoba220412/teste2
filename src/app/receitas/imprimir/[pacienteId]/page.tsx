'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita, Instituicao } from '@/types';
import { 
  Printer, ArrowLeft, Sun, Coffee, Utensils, Sunset, Clock, Moon, 
  AlertCircle, MapPin, Phone, User, Stethoscope, Pill 
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÃO DOS HORÁRIOS VISUAIS
// ============================================================================
const TIME_SLOTS = [
  { label: 'AO ACORDAR', time: '06:00' },
  { label: 'CAFÉ DA MANHÃ', time: '08:00' },
  { label: 'ALMOÇO', time: '12:00' },
  { label: 'À TARDE', time: '15:00' },
  { label: 'FIM DA TARDE', time: '18:00' },
  { label: 'JANTAR', time: '20:00' },
  { label: 'AO DEITAR', time: '22:00' },
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// Formata datas para DD/MM/AAAA
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

// Retorna ícone Lucide para cada faixa de horário
function getIconForTime(label: string) {
  switch(label) {
    case 'AO ACORDAR': return <Sun size={14} />;    case 'CAFÉ DA MANHÃ': return <Coffee size={14} />;
    case 'ALMOÇO': return <Utensils size={14} />;
    case 'À TARDE': return <Sun size={14} />;
    case 'FIM DA TARDE': return <Sunset size={14} />;
    case 'JANTAR': return <Utensils size={14} />;
    case 'AO DEITAR': return <Moon size={14} />;
    default: return <Clock size={14} />;
  }
}

// Converte um horário (ex: "08:00") em qual coluna ele pertence
function getTimeColumn(timeStr: string): string | null {
  if (!timeStr) return null;
  const hour = parseInt(timeStr.split(':')[0]);
  if (hour >= 6 && hour < 7) return 'AO ACORDAR';
  if (hour >= 7 && hour < 11) return 'CAFÉ DA MANHÃ';
  if (hour >= 11 && hour < 14) return 'ALMOÇO';
  if (hour >= 14 && hour < 17) return 'À TARDE';
  if (hour >= 17 && hour < 19) return 'FIM DA TARDE';
  if (hour >= 19 && hour < 21) return 'JANTAR';
  return 'AO DEITAR';
}

// Fallback: busca imagem baseada em palavras-chave no texto da indicação
// (usado apenas para receitas antigas que não têm o campo `symptoms` salvo)
function getIndicationIconBytext(text: string | undefined): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('dor')) return 'dor.png';
  if (lower.includes('cabeça')) return 'dordecabeca.png';
  if (lower.includes('cancer') || lower.includes('tumor')) return 'cancro.png';
  if (lower.includes('coração') || lower.includes('coracao')) return 'coracao.png';
  if (lower.includes('pele')) return 'pele.png';
  if (lower.includes('estomago') || lower.includes('jejum')) return 'gastrite.png';
  if (lower.includes('febre')) return 'febre.png';
  if (lower.includes('diabetes')) return 'diabetes.png';
  if (lower.includes('nausea') || lower.includes('vômito') || lower.includes('vomito')) return 'vomito.png';
  if (lower.includes('insônia') || lower.includes('insonia') || lower.includes('sono')) return 'insônia.png';
  return 'saude.png';
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ImprimirReceita() {
  const params = useParams();
  const router = useRouter();
  const receitaId = params?.pacienteId as string;
  
  const [receita, setReceita] = useState<Receita | null>(null);  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega a receita e (se houver) a instituição vinculada
  useEffect(() => {
    (async () => {
      if (receitaId) {
        try {
          const snap = await getDoc(doc(db, 'receitas', receitaId));
          if (snap.exists()) {
            const data = { id: snap.id, ...snap.data() } as Receita;
            setReceita(data);
            
            // Busca instituição vinculada
            if (data.instituicaoId) {
              const instSnap = await getDoc(doc(db, 'instituicoes', data.instituicaoId));
              if (instSnap.exists()) {
                setInstituicao({ id: instSnap.id, ...instSnap.data() } as Instituicao);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao carregar receita:', error);
        }
      }
      setLoading(false);
    })();
  }, [receitaId]);

  // ============================================================================
  // ESTADOS DE CARREGAMENTO E ERRO
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO RECEITA...</p>
        </div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-700 uppercase mb-4">RECEITA NÃO ENCONTRADA</p>
          <button             onClick={() => router.push('/dashboard')} 
            className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors"
          >
            VOLTAR AO INÍCIO
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PREPARAÇÃO DOS DADOS
  // ============================================================================
  const allItems = [
    ...(receita.medicamentos_fixos || []),
    ...(receita.medicamentos_sos || [])
  ];

  // Dados da instituição (prioriza buscada, depois gravada na receita)
  const instNome = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO NÃO INFORMADA';
  const instDescricao = instituicao?.descricao || '';
  const instEndereco = instituicao ? (
    `${instituicao.rua || ''}, ${instituicao.numero || ''}${instituicao.complemento ? ` - ${instituicao.complemento}` : ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''} - CEP: ${instituicao.cep || ''}`
  ) : 'ENDEREÇO NÃO CADASTRADO';
  const instTelefone = instituicao?.telefone1 || instituicao?.telefone2 || 'TELEFONE NÃO INFORMADO';

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0">
      
      {/* ==================================================================== */}
      {/* BARRA DE AÇÕES (OCULTA NA IMPRESSÃO) */}
      {/* ==================================================================== */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center print:hidden sticky top-0 z-50">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center gap-2 text-slate-600 font-semibold uppercase hover:text-teal-700 transition-colors"
        >
          <ArrowLeft size={20} /> VOLTAR
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors uppercase shadow-lg"
        >
          <Printer size={20} /> IMPRIMIR / PDF
        </button>
      </div>
      {/* ==================================================================== */}
      {/* CONTAINER PRINCIPAL DA RECEITA */}
      {/* ==================================================================== */}
      <div className="max-w-5xl mx-auto mt-6 bg-white shadow-xl rounded-3xl overflow-hidden print:shadow-none print:max-w-none print:rounded-none print:mt-0">
        
        {/* ================================================================== */}
        {/* CABEÇALHO CLÍNICO */}
        {/* ================================================================== */}
        <header className="border-b-4 border-teal-700 p-6 bg-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            
            {/* LADO ESQUERDO: INSTITUIÇÃO */}
            <div className="flex-1">
              <h1 className="text-2xl font-black text-teal-800 uppercase tracking-wide">
                {instNome}
              </h1>
              {instDescricao && (
                <p className="text-sm text-gray-600 uppercase mt-1">{instDescricao}</p>
              )}
            </div>

            {/* LADO DIREITO: DADOS DO PACIENTE */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                <User size={16} className="text-teal-700" />
                <h2 className="text-xs font-bold text-gray-700 uppercase">Dados do Paciente</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p className="col-span-2">
                  <span className="font-bold text-gray-600 uppercase">Nome: </span>
                  <span className="font-black text-gray-900 uppercase">{receita.nomePaciente || 'NÃO INFORMADO'}</span>
                </p>
                <p>
                  <span className="font-bold text-gray-600 uppercase">Nascimento: </span>
                  <span className="font-semibold text-gray-800 uppercase">{formatDate(receita.data_nasc)}</span>
                </p>
                <p>
                  <span className="font-bold text-gray-600 uppercase">Prontuário: </span>
                  <span className="font-semibold text-gray-800 uppercase">{receita.prontuario || 'NÃO INFORMADO'}</span>
                </p>
                <p className="col-span-2">
                  <span className="font-bold text-gray-600 uppercase">Data de Emissão: </span>
                  <span className="font-semibold text-gray-800 uppercase">
                    {formatDate(receita.dataEmissao || receita.data_criacao)}
                  </span>
                </p>
              </div>

              {/* ALERGIAS */}              <div className="mt-3 pt-2 border-t border-slate-200">
                <span className="font-bold text-gray-600 uppercase block text-xs mb-1">Alergias:</span>
                {receita.alergias && receita.alergias.trim() !== '' ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                    <span className="font-black text-red-700 uppercase text-sm">{receita.alergias.toUpperCase()}</span>
                  </div>
                ) : (
                  <span className="font-bold text-green-700 uppercase text-sm bg-green-50 px-2 py-1 rounded inline-block">
                    NEGA ALERGIAS
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================== */}
        {/* PAINEL VISUAL DE MEDICAMENTOS - BARRA DE HORÁRIOS (TOPO ESCURO) */}
        {/* ================================================================== */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2 overflow-x-auto print:bg-slate-100 print:text-black print:border-b-2 print:border-black">
          <span className="font-bold text-xs w-36 shrink-0 uppercase print:w-48 flex items-center gap-2">
            <Pill size={14} /> Medicamento / Motivo
          </span>
          <div className="flex-1 flex justify-between min-w-[600px]">
            {TIME_SLOTS.map((slot, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-[10px] text-center w-14">
                <div className="opacity-80">{getIconForTime(slot.label)}</div>
                <span className="font-bold uppercase leading-tight">{slot.label.split(' ')[0]}</span>
                <span className="opacity-60">{slot.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================== */}
        {/* LISTA DE MEDICAMENTOS */}
        {/* ================================================================== */}
        <div className="p-6 space-y-6">
          {allItems.length === 0 && (
            <p className="text-center text-gray-500 py-10 font-semibold uppercase">
              NENHUM MEDICAMENTO PRESCRITO NESTA RECEITA
            </p>
          )}

          {allItems.map((med: any, index) => {
            // Extrai a dose (primeira palavra do texto de posologia)
            const dose = med.texto_original_da_posologia?.split(' ')[0] || '1';
            
            // ✅ LÓGICA DE IMAGEM DO SINTOMA:            // 1. Tenta usar o array `symptoms` salvo no banco (receitas novas)
            // 2. Fallback para `getIndicationIconBytext` (receitas antigas)
            let imageName: string | null = null;
            if (med.symptoms && Array.isArray(med.symptoms) && med.symptoms.length > 0) {
              imageName = med.symptoms[0].file || null;
            }
            if (!imageName) {
              imageName = getIndicationIconBytext(med.indicacao);
            }
            const imagePath = imageName ? `/img/n/f/${imageName}` : null;

            return (
              <div key={index} className="relative group">
                {/* Separador entre medicamentos */}
                <div className="border-t-2 border-dashed border-slate-200 mb-4 first:mt-0 first:border-0"></div>

                <div className="flex gap-4 md:gap-6">
                  
                  {/* ================================================================== */}
                  {/* COLUNA ESQUERDA: NOME DO REMÉDIO + CARTÃO VISUAL DO MOTIVO */}
                  {/* ================================================================== */}
                  <div className="w-32 md:w-44 shrink-0 space-y-2">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase leading-tight">
                      {med.nome || 'MEDICAMENTO'}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs">💊</span>
                      <span>{dose.toUpperCase()}</span>
                    </div>
                    
                    {/* Cartão Visual do Sintoma */}
                    <div className="mt-3 bg-rose-50 border-2 border-rose-200 rounded-xl p-2 text-center shadow-sm">
                      <div className="h-20 w-full flex items-center justify-center bg-white rounded-lg mb-1 border border-rose-100 overflow-hidden">
                        {imagePath ? (
                          <img 
                            src={imagePath}
                            alt={med.indicacao || 'Motivo'}
                            className="h-16 w-auto object-contain"
                            onError={(e) => {
                              // Se a imagem não existir, esconde e mostra fallback
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = '<span class="text-3xl">💊</span>';
                              }
                            }} 
                          />
                        ) : (
                          <span className="text-3xl">❓</span>
                        )}
                      </div>                      <p className="font-bold text-rose-700 text-[10px] uppercase leading-tight px-1">
                        {med.indicacao || 'CONFORME PRESCRIÇÃO'}
                      </p>
                    </div>
                  </div>

                  {/* ================================================================== */}
                  {/* COLUNA DIREITA: GRADE DE HORÁRIOS */}
                  {/* ================================================================== */}
                  <div className="flex-1 grid grid-cols-7 gap-1 relative">
                    {/* Linhas guia verticais de fundo */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex-1 border-l border-slate-100 first:border-0"></div>
                      ))}
                    </div>

                    {TIME_SLOTS.map((slot, i) => {
                      // Verifica se este horário está prescrito para o medicamento
                      const isActive = med.horarios?.some((h: string) => {
                        const hCol = getTimeColumn(h);
                        return hCol === slot.label;
                      });

                      return (
                        <div key={i} className="h-full flex flex-col items-center justify-center z-10 py-1">
                          {isActive ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-md print:shadow-none print:bg-teal-700">
                                {dose}
                              </div>
                              <span className="text-[9px] font-bold text-teal-700 uppercase bg-teal-50 px-1 rounded print:bg-transparent">
                                {slot.time}
                              </span>
                            </div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* ================================================================== */}        {/* RODAPÉ PROFISSIONAL */}
        {/* ================================================================== */}
        <footer className="mt-8 border-t-4 border-teal-700 bg-slate-50 p-6 print:bg-white print:mt-4">
          
          {/* DADOS COMPLETOS DA INSTITUIÇÃO */}
          <div className="mb-6 pb-4 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-700 uppercase">
              <div className="flex items-center gap-2">
