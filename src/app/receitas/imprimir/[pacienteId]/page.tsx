// src/app/receitas/imprimir/[pacienteId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Printer, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ImprimirReceita({ params }: { params: { pacienteId: string } }) {
  const [receita, setReceita] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lista de horários padrão para o cabeçalho da tabela (de 2h em 2h)
  const horariosCols = ['02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'];

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

  // Verifica se o array de horários do medicamento inclui a hora da coluna
  // Ex: array ["06:00", "12:00"] e hora "06" -> true
  const verificaHorario = (horariosMed: string[], horaCol: string) => {
    if (!horariosMed || !Array.isArray(horariosMed)) return false;
    return horariosMed.some(h => h.startsWith(horaCol));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4 uppercase font-black">
      <Loader2 className="animate-spin text-teal-700" size={60} />
      <p>Acessando Dados...</p>
    </div>
  );

  if (!receita) return (
    <div className="p-20 text-center flex flex-col items-center gap-6 bg-white min-h-screen uppercase">
      <AlertTriangle size={100} className="text-rose-500" />
      <h1 className="text-3xl font-black">Receita Não Encontrada</h1>
      <p className="text-slate-500 font-bold max-w-lg">
        Não localizamos a prescrição para o ID: <span className="text-rose-600 border-b-4 border-rose-100">"{params.pacienteId}"</span>
      </p>
      <Button onClick={() => window.history.back()} className="mt-4 bg-teal-700">VOLTAR</Button>
    </div>
  );

  const usoContinuo = receita.itens || receita.medicamentos_fixos || [];
  const sos = receita.medicamentos_sos || [];

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center print:bg-white print:p-0">
      
      {/* Botão flutuante para impressão (não sai no papel) */}
      <div className="fixed bottom-8 right-8 print:hidden z-50">
        <Button onClick={() => window.print()} className="bg-teal-700 hover:bg-teal-800 text-white font-black px-8 py-6 shadow-2xl rounded-full flex gap-3 text-lg border-2 border-white">
          <Printer size={28} /> IMPRIMIR
        </Button>
      </div>

      {/* Container principal (simulando uma folha A4) */}
      <div className="bg-white w-full max-w-5xl p-10 shadow-lg rounded-sm text-gray-800 font-sans print:shadow-none print:w-full print:max-w-none print:p-4">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900 mb-2">
              {receita.instituicaoNome || 'Instituição de Saúde'}
            </h1>
            <p><span className="font-semibold text-gray-700 uppercase">Paciente:</span> <span className="uppercase">{receita.nomePaciente}</span></p>
            <p><span className="font-semibold text-gray-700 uppercase">Nascimento:</span> {receita.data_nasc || 'DD/MM/AAAA'}</p>
            <p><span className="font-semibold text-gray-700 uppercase">Alergia:</span> Nega alergias (Padrão)</p>
          </div>
          <div className="text-right space-y-1">
            <p><span className="font-semibold text-gray-700 uppercase">Data:</span> {new Date().toLocaleDateString('pt-BR')}</p>
            <p><span className="font-semibold text-gray-700 uppercase">Prontuário:</span> {receita.prontuario}</p>
          </div>
        </div>

        {/* USO CONTÍNUO */}
        {usoContinuo.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-center mb-4 uppercase bg-gray-200 py-1 rounded print:bg-gray-200 print:text-black">
              Uso Contínuo - Aprazamento
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400 text-sm">
                <thead>
                  <tr className="bg-gray-50 print:bg-gray-50">
                    <th className="border border-gray-400 p-2 text-left w-1/4 uppercase">Medicamento</th>
                    {horariosCols.map((hora) => (
                      <th key={hora} className="border border-gray-400 p-2 text-center w-8">
                        {hora}
                      </th>
                    ))}
                    <th className="border border-gray-400 p-2 text-center w-24 uppercase">Para que<br/>serve</th>
                  </tr>
                </thead>
                <tbody>
                  {usoContinuo.map((med: any, i: number) => (
                    <tr key={i}>
                      <td className="border border-gray-400 p-2">
                        <p className="font-bold uppercase text-sm">{med.nomeMedicamento || med.nome}</p>
                        <p className="text-gray-600 text-xs uppercase">{med.dose || med.apresentacao}</p>
                      </td>
                      {horariosCols.map((hora) => (
                        <td key={`${i}-${hora}`} className="border border-gray-400 p-2 text-center align-middle">
                          {verificaHorario(med.horarios, hora) && (
                            <div className="mx-auto w-4 h-4 rounded-full bg-black print:bg-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">
                        {med.indicacao}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SOS */}
        {sos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-center mb-4 uppercase bg-gray-200 py-1 rounded print:bg-gray-200 print:text-black">
              S. O. S. (Se Necessário)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400 text-sm">
                <thead>
                  <tr className="bg-gray-50 print:bg-gray-50">
                    <th className="border border-gray-400 p-2 text-left w-1/4 uppercase">Medicamento</th>
                    {horariosCols.map((hora) => (
                      <th key={`sos-h-${hora}`} className="border border-gray-400 p-2 text-center w-8">
                        {hora}
                      </th>
                    ))}
                    <th className="border border-gray-400 p-2 text-center w-24 uppercase">Para que<br/>serve</th>
                  </tr>
                </thead>
                <tbody>
                  {sos.map((med: any, i: number) => (
                    <tr key={`sos-${i}`}>
                      <td className="border border-gray-400 p-2">
                        <p className="font-bold uppercase text-sm">{med.nome}</p>
                        <p className="text-gray-600 text-[10px] uppercase font-bold mt-1">
                          {med.texto_original_da_posologia}
                        </p>
                      </td>
                      {horariosCols.map((hora) => (
                        <td key={`sos-${i}-${hora}`} className="border border-gray-400 p-2 text-center">
                          {/* SOS geralmente não tem horário fixo salvo no banco, deixamos em branco para marcação manual ou adicionamos lógica extra se necessário */}
                        </td>
                      ))}
                      <td className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">
                        {med.indicacao || 'SOS'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RODAPÉ E ASSINATURAS */}
        <div className="mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-center gap-12">
          <div className="w-full md:w-1/3">
            <div className="border-b border-gray-800 w-full mb-2"></div>
            <p className="font-bold text-gray-800 uppercase">Médico(a) Resp.</p>
            <p className="text-gray-600 text-sm uppercase">{receita.medico || 'MÉDICO(A) NÃO IDENTIFICADO(A)'}</p>
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="border-b border-gray-800 w-full mb-2"></div>
            <p className="font-bold text-gray-800 uppercase">Farmacêutico(a)</p>
            <p className="text-gray-600 text-sm uppercase">{receita.farmaceutico || '___________________________'}</p>
          </div>
        </div>

      </div>

      {/* ESTILOS GLOBAIS PARA IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          body { 
            background-color: white !important; 
            margin: 0; 
            padding: 0; 
          }
          .bg-gray-100 { 
            background-color: white !important; 
          }
          @page { 
            size: A4 portrait; 
            margin: 1cm; 
          }
          /* Força a impressão das cores de fundo (bg-gray-200) e as bolinhas pretas */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
