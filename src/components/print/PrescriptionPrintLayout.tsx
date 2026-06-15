'use client';

import React from 'react';
import { IReceita, ItemPrescrito } from '@/lib/types';
import Image from 'next/image';

interface Props {
  receita: IReceita;
  showControls?: boolean;
  onPrint?: () => void;
}

/**
 * Componente de impressão de receita médica otimizado para papel A4.
 * 
 * Características:
 * - Layout responsivo para A4 (retrato e paisagem)
 * - Controle de quebras de página para não cortar medicamentos
 * - Ícones de sintomas grandes e legíveis (w-16 h-16)
 * - Grade dinâmica com colunas: Medicamento, Horários, Via, Pra Que Serve?
 * - CSS @media print configurado para impressão frente e verso
 */
export default function PrescriptionPrintLayout({ receita, showControls = true, onPrint }: Props) {
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-gray-100 min-h-screen">
      
      {/* Controles visíveis apenas na tela */}
      {showControls && (
        <div className="flex gap-4 no-print">
          <button 
            onClick={handlePrint} 
            className="px-6 py-3 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 uppercase flex items-center"
          >
            🖨️ Imprimir Receita (A4)
          </button>
          <button 
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 uppercase"
          >
            ✏️ Editar Prescrição
          </button>
        </div>
      )}

      {/* Folha A4 */}
      <div 
        id="receita-a4"
        className="bg-white shadow-2xl relative overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          boxSizing: 'border-box',
          fontFamily: '"Inter", sans-serif',
        }}
      >
        {/* Cabeçalho */}
        <header className="border-b-4 border-black pb-4 mb-6 flex justify-between items-end">
          <div className="w-2/3">
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
              {receita.instituicaoNome || "INSTITUIÇÃO DE SAÚDE"}
            </h1>
            <p className="text-sm font-bold uppercase text-gray-600 mt-1">
              RECEITA MÉDICA FACILITADA
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold uppercase">Paciente: {receita.pacienteNome}</p>
            <p className="text-md font-semibold uppercase text-gray-700">Prontuário: {receita.prontuario}</p>
            <p className="text-md font-semibold uppercase text-gray-700">Data: {formatDate(receita.dataCriacao)}</p>
          </div>
        </header>

        {/* Corpo da Receita - Grade Dinâmica */}
        <main className="w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="text-left p-3 uppercase font-black text-sm w-[35%]">
                  Medicamento & Dose
                </th>
                <th className="text-left p-3 uppercase font-black text-sm w-[25%]">
                  Como Usar (Horários)
                </th>
                <th className="text-center p-3 uppercase font-black text-sm w-[15%]">
                  Via
                </th>
                <th className="text-center p-3 uppercase font-black text-sm w-[25%]">
                  Pra Que Serve? (Ícone)
                </th>
              </tr>
            </thead>
            <tbody>
              {receita.itensPrescritos.map((item, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-300 break-inside-avoid"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  {/* Coluna 1: Nome do Medicamento + Apresentação + Dose */}
                  <td className="p-4 align-top">
                    <div className="font-black text-xl uppercase leading-tight text-black">
                      {item.medicamentoNome}
                    </div>
                    <div className="font-bold text-lg uppercase text-gray-800 mt-1">
                      {item.dose}{' '}
                      <span className="font-normal text-gray-600">
                        ({item.apresentacao})
                      </span>
                    </div>
                  </td>
                  
                  {/* Coluna 2: Aprazamento (Horários ou Intervalos) */}
                  <td className="p-4 align-top">
                    <div className="font-bold text-lg uppercase bg-yellow-50 inline-block px-2 py-1 rounded border border-yellow-200">
                      {item.aprazamento}
                    </div>
                  </td>
                  
                  {/* Coluna 3: Via de Administração */}
                  <td className="p-4 align-top text-center">
                    <span className="font-bold text-md uppercase border-2 border-black rounded-full px-3 py-1 inline-block">
                      {item.via}
                    </span>
                  </td>
                  
                  {/* Coluna 4: Ícone de Sintoma + Indicação */}
                  <td className="p-4 align-top text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      {item.indicacaoIcone ? (
                        <div className="relative w-16 h-16 md:w-20 md:h-20">
                          <Image
                            src={`/img/n/f/${item.indicacaoIcone}`}
                            alt={item.indicacaoTexto || "Indicação"}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold uppercase text-gray-500">
                          SEM ÍCONE
                        </div>
                      )}
                      <span className="font-bold text-sm uppercase text-gray-700 mt-1">
                        {item.indicacaoTexto || "Uso Geral"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Orientações Gerais (opcional) */}
          {receita.orientacoesGerais && (
            <div className="mt-8 p-4 border-2 border-dashed border-gray-400 rounded bg-gray-50 break-inside-avoid">
              <h3 className="font-black uppercase text-lg mb-2">Orientações Importantes:</h3>
              <p className="font-bold uppercase text-gray-800">{receita.orientacoesGerais}</p>
            </div>
          )}
        </main>

        {/* Rodapé - Assinatura e Registro */}
        <footer className="absolute bottom-0 left-0 w-full p-8 mt-12 break-inside-avoid">
          <div className="flex flex-col items-center justify-center border-t-2 border-black pt-4">
            <p className="font-black text-xl uppercase mb-1">{receita.profissionalNome}</p>
            <p className="font-bold text-sm uppercase text-gray-600">
              Profissional Responsável
            </p>
          </div>
        </footer>
      </div>

      {/* Estilos CSS específicos para impressão A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          #receita-a4 {
            box-shadow: none;
            margin: 0;
            width: 100%;
            height: 100%;
            page-break-after: always;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
