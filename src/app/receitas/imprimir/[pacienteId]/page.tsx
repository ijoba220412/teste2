'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita } from '@/types';
import { 
  Printer, 
  ArrowLeft, 
  Sun, 
  Coffee, 
  Utensils, 
  Sunset, 
  Clock, 
  Moon 
} from 'lucide-react';

// --- CONFIGURAÇÃO DOS HORÁRIOS VISUAIS ---
const TIME_SLOTS = [
  { label: 'AO ACORDAR', time: '06:00', icon: 'WAKE' },
  { label: 'CAFÉ DA MANHÃ', time: '08:00', icon: 'BREAKFAST' },
  { label: 'ALMOÇO', time: '12:00', icon: 'LUNCH' },
  { label: 'À TARDE', time: '15:00', icon: 'AFTERNOON' },
  { label: 'FIM DA TARDE', time: '18:00', icon: 'LATE_AFTERNOON' },
  { label: 'JANTAR', time: '20:00', icon: 'DINNER' },
  { label: 'AO DEITAR', time: '22:00', icon: 'BED' },
];

// --- FUNÇÕES AUXILIARES ---
function getIconForTime(label: string) {
  switch(label) {
    case 'AO ACORDAR': return <Sun size={16} />;
    case 'CAFÉ DA MANHÃ': return <Coffee size={16} />;
    case 'ALMOÇO': return <Utensils size={16} />;
    case 'À TARDE': return <Sun size={16} />;
    case 'FIM DA TARDE': return <Sunset size={16} />;
    case 'JANTAR': return <Utensils size={16} />;
    case 'AO DEITAR': return <Moon size={16} />;
    default: return <Clock size={16} />;
  }
}

function getTimeColumn(timeStr: string) {
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

function getIndicationIcon(text: string | undefined) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('dor')) return '/img/n/f/dor.png';
  if (lower.includes('cabeça')) return '/img/n/f/dordecabeca.png';
  if (lower.includes('cancer') || lower.includes('tumor')) return '/img/n/f/cancro.png';
  if (lower.includes('coração')) return '/img/n/f/coracao.png';
  if (lower.includes('pele')) return '/img/n/f/pele.png';
  if (lower.includes('estomago') || lower.includes('jejum')) return '/img/n/f/gastrite.png';
  // Padrão genérico de "medicamento"
  return '/img/n/f/saude.png'; 
}

export default function ImprimirReceita() {
  const params = useParams();
  const router = useRouter();
  const receitaId = params?.pacienteId as string;
  
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (receitaId) {
        const snap = await getDoc(doc(db, 'receitas', receitaId));
        if (snap.exists()) {
          setReceita({ id: snap.id, ...snap.data() } as Receita);
        }
      }
      setLoading(false);
    })();
  }, [receitaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 text-center">
        <p>Receita não encontrada.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-teal-700 underline">Voltar</button>
      </div>
    );
  }

  // Mesclar fixos e SOS para exibição visual
  const allItems = [
    ...(receita.medicamentos_fixos || []),
    ...(receita.medicamentos_sos || [])
  ];

  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:pb-0">
      
      {/* BARRA DE NAVEGAÇÃO (Oculta na impressão) */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center print:hidden">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-600 font-semibold">
          <ArrowLeft size={20} /> Voltar
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition"
        >
          <Printer size={20} /> IMPRIMIR
        </button>
      </div>

      <div className="max-w-5xl mx-auto mt-6 bg-white shadow-xl rounded-3xl overflow-hidden print:shadow-none print:max-w-none print:rounded-none">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-6 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
          <h1 className="text-2xl font-black uppercase tracking-wider">Painel Visual de Medicamentos</h1>
          <p className="text-slate-400 text-sm mt-1 print:text-black">
            PACIENTE: <span className="font-bold text-white print:text-black">{receita.nomePaciente}</span>
          </p>
        </div>

        {/* LINHA DO TEMPO (TOP BAR) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2 overflow-x-auto print:bg-slate-100 print:text-black print:border-b-2 print:border-black">
          <span className="font-bold text-sm w-32 shrink-0 uppercase print:w-48">MEDICAMENTO E MOTIVO</span>
          <div className="flex-1 flex justify-between min-w-[600px]">
            {TIME_SLOTS.map((slot, i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-xs text-center w-14">
                <div className="opacity-80">{getIconForTime(slot.label)}</div>
                <span className="font-bold uppercase leading-tight">{slot.label.split(' ')[0]}</span>
                <span className="opacity-60">{slot.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LISTA DE MEDICAMENTOS */}
        <div className="p-6 space-y-8">
          {allItems.length === 0 && (
            <p className="text-center text-gray-500 py-10">Nenhum medicamento cadastrado.</p>
          )}

          {allItems.map((med: any, index) => {
            const indicationIcon = getIndicationIcon(med.indicacao);
            const dose = med.texto_original_da_posologia?.split(' ')[0] || '1'; // Tenta pegar "500MG" ou "1"
            
            return (
              <div key={index} className="relative group">
                {/* Divisor entre medicamentos */}
                <div className="border-t-2 border-dashed border-slate-200 mb-6 first:mt-0"></div>

                {/* Card Principal */}
                <div className="flex gap-6">
                  
                  {/* Coluna Esquerda: Info do Remédio */}
                  <div className="w-32 md:w-48 shrink-0 space-y-3">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase leading-none">
                      {med.nome || 'Medicamento'}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                      <span className="bg-teal-100 text-teal-800 p-1 rounded-md">💊</span>
                      <span>{dose.toUpperCase()}</span>
                    </div>
                    
                    {/* Cartão de Motivo Visual */}
                    {med.indicacao && (
                      <div className="mt-4 bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 text-center shadow-sm">
                        <div className="h-24 w-full flex items-center justify-center bg-white rounded-xl mb-2 border border-rose-100 overflow-hidden">
                           {/* Tenta carregar a imagem, se falhar mostra ícone */}
                           <img 
                             src={indicationIcon ?? undefined} // ✅ CORREÇÃO: null -> undefined
                             alt={med.indicacao}
                             className="h-16 w-auto object-contain"
                             onError={(e) => (e.currentTarget.style.display = 'none')} 
                           />
                           {/* Fallback se a imagem não carregar */}
                           {!indicationIcon && <span className="text-4xl">❓</span>}
                        </div>
                        <p className="font-bold text-rose-700 text-sm uppercase leading-none">{med.indicacao}</p>
                      </div>
                    )}
                  </div>

                  {/* Coluna Direita: Grade de Horários */}
                  <div className="flex-1 grid grid-cols-7 gap-2 relative">
                    {/* Linhas guia verticais */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex-1 border-l border-slate-100 first:border-0"></div>
                      ))}
                    </div>

                    {TIME_SLOTS.map((slot, i) => {
                      const timeCol = getTimeColumn(slot.time);
                      const medTimeCol = med.horarios?.some((h: string) => getTimeColumn(h) === slot.label) 
                                        ? true 
                                        : (slot.label === 'AO ACORDAR' && (med.horarios || []).includes('06:00')); // Case específico para 6h

                      // Verifica se o horário do slot bate com algum horário prescrito
                      const isActive = med.horarios?.some((h: string) => {
                        const hCol = getTimeColumn(h);
                        return hCol === slot.label;
                      });

                      return (
                        <div key={i} className="h-full flex flex-col items-center justify-center z-10 py-2">
                          {isActive ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg animate-pulse print:animate-none">
                                {dose}
                              </div>
                              <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-1 rounded">
                                {slot.time}
                              </span>
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
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

        {/* RODAPÉ */}
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t">
          Gerado por Receita Facilitada • {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
