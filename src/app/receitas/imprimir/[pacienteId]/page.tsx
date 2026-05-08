// src/app/receitas/imprimir/[pacienteId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Printer, AlertTriangle, Sunrise, Sun, Sunset, Moon, 
  Activity, Phone, MapPin, ShieldCheck, Calendar, Pill, 
  Droplets, Stethoscope, Heart, Wind, CheckCircle2, User, 
  Coffee, Navigation, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// --- TRADUTOR VISUAL PARA ANALFABETOS ---
const getPurposeIcon = (text: string = "") => {
  const t = text.toUpperCase();
  if (t.includes("DOR") || t.includes("FEBRE")) return <Activity className="text-red-500" size={50} />;
  if (t.includes("ESTÔMAGO") || t.includes("ENJOO") || t.includes("VÔMITO") || t.includes("PROTEGER") || t.includes("AZIA")) return <ShieldCheck className="text-green-500" size={50} />;
  if (t.includes("CORAÇÃO") || t.includes("PRESSÃO") || t.includes("SANGUE") || t.includes("CIRCULAÇÃO")) return <Heart className="text-rose-600" size={50} />;
  if (t.includes("PULMÃO") || t.includes("AR") || t.includes("TOSSE") || t.includes("RESPIRAR") || t.includes("BOMBINHA")) return <Wind className="text-sky-400" size={50} />;
  if (t.includes("DORMIR") || t.includes("INSÔNIA") || t.includes("ANSIEDADE")) return <Moon className="text-indigo-600" size={50} />;
  return <Stethoscope className="text-teal-600" size={50} />;
};

const getMedTypeIcon = (text: string = "") => {
  const t = text.toUpperCase();
  if (t.includes("GOTAS") || t.includes("ML") || t.includes("SOLUÇÃO") || t.includes("XAROPE")) return <Droplets className="text-blue-500" size={42} />;
  if (t.includes("SPRAY") || t.includes("BOMBINHA") || t.includes("INALAR")) return <Wind className="text-cyan-500" size={42} />;
  return <Pill className="text-teal-700 rotate-45" size={42} />;
};

const PERIODS = [
  { id: '06:00', label: 'CAFÉ DA MANHÃ', icon: <Sunrise className="text-amber-500" size={42} />, sub: <Coffee size={18}/> },
  { id: '12:00', label: 'ALMOÇO', icon: <Sun className="text-orange-500" size={42} />, sub: null },
  { id: '18:00', label: 'JANTA', icon: <Sunset className="text-rose-500" size={42} />, sub: null },
  { id: '22:00', label: 'DORMIR', icon: <Moon className="text-indigo-500" size={42} />, sub: <Navigation className="rotate-180" size={18}/> },
];

export default function ImprimirReceita({ params }: { params: { pacienteId: string } }) {
  const [receita, setReceita] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirect = async () => {
      try {
        setLoading(true);
        // BUSCA 1: Tenta o ID DIRETO do Firebase (ID Automático)
        const docRef = doc(db, 'receitas', params.pacienteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReceita({ id: docSnap.id, ...docSnap.data() });
        } else {
          // BUSCA 2: Se falhar o ID, tenta buscar pelo campo prontuario
          const q = query(collection(db, 'receitas'), where('prontuario', '==', params.pacienteId));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            setReceita({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDirect();
  }, [params.pacienteId]);

  // Função que verifica se o remédio deve ser tomado em tal hora (lê o texto do seu Firebase)
  const deveTomar = (med: any, period: string) => {
    const texto = (med.texto_original_da_posologia || med.nome || "").toUpperCase();
    const horaSimples = period.split(':')[0]; // Ex: "06"
    return texto.includes(period) || texto.includes(`${horaSimples}H`) || texto.includes(`${horaSimples}:00`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4 uppercase font-black">
      <Loader2 className="animate-spin text-teal-700" size={60} />
      <p>Acessando ID: {params.pacienteId}</p>
    </div>
  );

  if (!receita) return (
    <div className="p-20 text-center flex flex-col items-center gap-6 bg-white min-h-screen uppercase">
      <AlertTriangle size={100} className="text-rose-500" />
      <h1 className="text-3xl font-black">Receita Não Encontrada</h1>
      <p className="text-slate-500 font-bold max-w-lg">
        O ID AUTOMÁTICO <span className="text-rose-600 border-b-4 border-rose-100">"{params.pacienteId}"</span> NÃO EXISTE NO FIREBASE.
      </p>
      <Button onClick={() => window.history.back()} className="mt-4 bg-teal-700">VOLTAR</Button>
    </div>
  );

  const medicamentos = [...(receita.medicamentos_fixos || []), ...(receita.itens || [])];

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:p-0">
      
      <div className="fixed bottom-8 right-8 print:hidden z-50">
        <Button onClick={() => window.print()} className="bg-teal-700 text-white font-black px-12 py-8 shadow-2xl rounded-[2rem] flex gap-4 scale-110 border-4 border-white transition-all hover:scale-105">
          <Printer size={32} /> IMPRIMIR RECEITA VISUAL
        </Button>
      </div>

      <div className="max-w-[1200px] mx-auto bg-white min-h-screen shadow-2xl print:shadow-none relative p-8 border-t-[20px] border-teal-800">
        
        {/* CABEÇALHO */}
        <header className="flex justify-between items-center mb-10 border-b-2 border-slate-100 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-teal-800 tracking-tighter uppercase leading-none">INCA - HCIV</h1>
            <p className="text-xl font-bold text-teal-600 uppercase tracking-widest italic opacity-80 font-sans">Hospital do Câncer IV</p>
          </div>
          
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl min-w-[400px]">
            <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
               <div className="bg-teal-600 p-4 rounded-2xl shadow-inner"><User size={32} /></div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Paciente</p>
                  <p className="text-2xl font-black uppercase leading-tight tracking-tighter">{receita.nomePaciente}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 text-[10px] font-black uppercase text-slate-400">
              <div>PRONTUÁRIO: <span className="text-white text-2xl block font-black">{receita.prontuario}</span></div>
              <div className="text-right">DATA: <span className="text-white text-2xl block font-black">{receita.dataEmissao || receita.data_criacao || '--/--/----'}</span></div>
            </div>
          </div>
        </header>

        {/* --- GRADE VISUAL PARA ANALFABETOS --- */}
        <div className="rounded-[3.5rem] border-[8px] border-slate-900 overflow-hidden mb-12 shadow-2xl bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-10 text-left text-3xl font-black uppercase tracking-tighter w-[40%]">O QUE TOMAR?</th>
                {PERIODS.map(p => (
                  <th key={p.id} className="p-4 border-l-2 border-slate-800">
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="bg-white/10 p-5 rounded-full shadow-inner">{p.icon}</div>
                      <span className="text-[11px] font-black tracking-widest mt-3 opacity-70">{p.label}</span>
                      <span className="text-xl font-black">{p.id}</span>
                    </div>
                  </th>
                ))}
                <th className="p-10 text-center text-xl font-black border-l-2 border-slate-800 uppercase w-[20%]">PRA QUE SERVE?</th>
              </tr>
            </thead>
            <tbody className="divide-y-8 divide-slate-100">
              {medicamentos.map((med: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-10 border-r-2 border-slate-100">
                    <div className="flex items-center gap-8">
                      <div className="p-6 bg-teal-50 rounded-[2.5rem] border-2 border-teal-100 shadow-sm transition-transform">
                        {getMedTypeIcon(med.texto_original_da_posologia || med.nome)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase leading-none mb-3 tracking-tighter">{med.nome}</h2>
                        <div className="bg-teal-50/50 border border-teal-100 px-6 py-3 rounded-2xl">
                          <p className="text-sm font-black text-teal-800 uppercase tracking-wide">
                             {med.texto_original_da_posologia || med.dose}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {PERIODS.map(p => {
                    const ativo = deveTomar(med, p.id);
                    return (
                      <td key={p.id} className={`p-4 border-l-2 border-slate-50 text-center transition-all ${ativo ? 'bg-teal-50/30' : ''}`}>
                        {ativo && (
                          <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                            <CheckCircle2 size={64} className="text-green-500 fill-white" strokeWidth={4} />
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">TOMAR AGORA</span>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-10 border-l-2 border-slate-50 bg-slate-50/40">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="bg-white p-6 rounded-full shadow-xl border-2 border-slate-100">
                         {getPurposeIcon(med.indicacao)}
                      </div>
                      <span className="text-xs font-black text-slate-700 leading-tight uppercase max-w-[150px] tracking-tight">
                        {med.indicacao}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SOS */}
        {receita.medicamentos_sos?.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-6 mb-10">
              <div className="bg-rose-600 text-white p-10 rounded-[3rem] shadow-2xl flex items-center gap-8 border-b-8 border-rose-800">
                <AlertTriangle size={64} fill="white" stroke="red" />
                <div className="text-left leading-none uppercase">
                  <p className="text-5xl font-black tracking-tighter">S. O. S.</p>
                  <p className="text-sm font-black text-rose-200 mt-3 tracking-[0.3em]">SOMENTE SE PRECISAR</p>
                </div>
              </div>
              <div className="h-2 flex-1 bg-rose-100 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-10">
               {receita.medicamentos_sos.map((med: any, i: number) => (
                 <div key={i} className="flex items-center gap-8 bg-rose-50/50 p-10 rounded-[3.5rem] border-4 border-rose-100 shadow-inner">
                   <div className="bg-white p-8 rounded-full shadow-lg text-rose-600">{getMedTypeIcon(med.nome)}</div>
                   <div className="flex-1">
                      <h4 className="text-3xl font-black text-slate-900 uppercase leading-none mb-4 tracking-tighter">{med.nome}</h4>
                      <p className="text-base font-black text-rose-700 uppercase leading-relaxed italic">
                        {med.texto_original_da_posologia}
                      </p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        <footer className="mt-24 flex justify-between items-end border-t-4 border-slate-100 pt-20 px-12 pb-6">
            <div className="text-left space-y-8">
              <div className="border-b-[8px] border-teal-800 w-96 mb-4 rounded-full"></div>
              <div>
                <p className="text-3xl font-black text-teal-950 uppercase tracking-tighter leading-none">{receita.medico || "DRA. JANAINA BRANDÃO"}</p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mt-3">MÉDICO(A) RESPONSÁVEL</p>
              </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.6em] mb-6">PRESCRIÇÃO DIGITAL V2.0 - 2025</p>
                <div className="flex items-center gap-4 text-teal-900 justify-end font-black uppercase text-base bg-teal-50 px-10 py-5 rounded-3xl border-2 border-teal-100 shadow-xl">
                  <CheckCircle2 size={24} className="text-green-500" strokeWidth={3} />
                  VIA ÚNICA DO PACIENTE
                </div>
            </div>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body { background-color: white !important; margin: 0; padding: 0; }
          .bg-slate-100 { background-color: white !important; padding: 0; }
          @page { size: landscape; margin: 0.5cm; }
          .print-hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}