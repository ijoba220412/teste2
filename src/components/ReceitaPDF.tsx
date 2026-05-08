// src/components/ReceitaPDF.tsx
'use client';
import React from 'react';
import { 
  Sun, SunMedium, Sunset, Moon, Bed, 
  Droplets, Pill, AlertTriangle, Info, Phone, 
  Stethoscope, ShieldCheck, Activity 
} from 'lucide-react';
import { Receita, Instituicao, ItemMedicamento, MedicamentoPosologia } from '@/types';
import { formatDate } from '@/utils/formatDate';

const PERIOD_ICONS: Record<string, any> = {
  '06:00': { icon: Sun, label: 'MANHÃ', color: 'text-amber-500', bg: 'bg-amber-50' },
  '10:00': { icon: SunMedium, label: 'MEIO-DIA', color: 'text-orange-500', bg: 'bg-orange-50' },
  '14:00': { icon: Sunset, label: 'TARDE', color: 'text-rose-500', bg: 'bg-rose-50' },
  '18:00': { icon: Moon, label: 'NOITE', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  '22:00': { icon: Bed, label: 'DORMIR', color: 'text-slate-700', bg: 'bg-slate-100' },
};

export const ReceitaPDF: React.FC<{ receita: Receita; instituicao?: Instituicao }> = ({ receita, instituicao }) => {
  const horariosPadrao = ['06:00', '10:00', '14:00', '18:00', '22:00'];

  return (
    <div className="max-w-[1000px] mx-auto bg-white p-8 print:p-0 uppercase">
      {/* HEADER PROFISSIONAL */}
      <div className="flex justify-between items-start border-b-4 border-teal-700 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-teal-800 leading-tight">{instituicao?.nome}</h1>
          <p className="text-sm font-bold text-slate-500">{instituicao?.descricao}</p>
        </div>
        <div className="text-right text-[10px] font-bold text-slate-400">
          <p className="flex items-center justify-end gap-1"><Phone size={12} /> {instituicao?.telefone1}</p>
          <p>{instituicao?.cidade} - {instituicao?.uf}</p>
        </div>
      </div>

      {/* CARD DO PACIENTE */}
      <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 grid grid-cols-3 gap-6 shadow-sm">
        <div className="col-span-1">
          <label className="text-[10px] font-black text-teal-600">PACIENTE</label>
          <p className="text-xl font-black text-slate-800">{receita.nomePaciente}</p>
        </div>
        <div>
          <label className="text-[10px] font-black text-teal-600">PRONTUÁRIO</label>
          <p className="text-xl font-black text-slate-800">{receita.prontuario}</p>
        </div>
        <div className="text-right">
          <label className="text-[10px] font-black text-teal-600">DATA DA PRESCRIÇÃO</label>
          <p className="text-lg font-bold text-slate-700">{formatDate(receita.dataEmissao)}</p>
        </div>
      </div>

      {/* GRADE DE HORÁRIOS (SISTEMA VISUAL) */}
      <div className="mb-10 overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="p-4 text-left text-sm font-black border-r border-teal-600/30">MEDICAMENTO</th>
              {horariosPadrao.map(h => {
                const Config = PERIOD_ICONS[h];
                return (
                  <th key={h} className="p-2 border-r border-teal-600/30">
                    <div className="flex flex-col items-center">
                      <Config.icon size={20} className="mb-1" />
                      <span className="text-[10px] font-black">{Config.label}</span>
                      <span className="text-xs">{h}</span>
                    </div>
                  </th>
                )
              })}
              <th className="p-4 text-left text-sm font-black w-48 text-center">PARA QUE SERVE?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receita.itens.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 border-r border-slate-100">
                  <p className="font-black text-teal-900 text-sm leading-tight">{item.nomeMedicamento}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">{item.principio}</p>
                </td>
                
                {horariosPadrao.map(h => {
                  const ativo = item.horarios.includes(h);
                  const isGotas = item.dose.toLowerCase().includes('gotas');
                  
                  return (
                    <td key={h} className={`p-4 border-r border-slate-100 text-center ${ativo ? PERIOD_ICONS[h].bg : ''}`}>
                      {ativo && (
                        <div className="flex flex-col items-center gap-1 animate-in zoom-in-50 duration-300">
                          {isGotas ? (
                            <Droplets className="text-cyan-500 fill-cyan-100" size={24} />
                          ) : (
                            <Pill className="text-teal-600 rotate-45" size={24} />
                          )}
                          <span className="text-[10px] font-black text-slate-700">{item.dose}</span>
                        </div>
                      )}
                    </td>
                  )
                })}

                <td className="p-4 bg-slate-50/50">
                  <div className="flex flex-col items-center text-center gap-2">
                     <span className="text-[9px] font-black text-teal-700 leading-tight uppercase">
                       {item.indicacao}
                     </span>
                     <ShieldCheck size={24} className="text-teal-200" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEÇÃO SOS (ALERTAS) */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
           <div className="h-1 flex-1 bg-rose-100 rounded-full"></div>
           <div className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-full font-black text-lg italic">
             <AlertTriangle size={24} /> S.O.S (SE NECESSÁRIO) <AlertTriangle size={24} />
           </div>
           <div className="h-1 flex-1 bg-rose-100 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          {receita.medicamentos_sos.map((sos, idx) => (
            <div key={idx} className="bg-white border-2 border-rose-100 rounded-2xl p-4 flex gap-4 hover:border-rose-300 transition-all shadow-sm">
              <div className="bg-rose-50 p-3 rounded-xl flex items-center justify-center">
                <Activity className="text-rose-600" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-rose-900 leading-tight text-sm uppercase">{sos.nome}</h4>
                <p className="text-xs font-bold text-slate-600 mt-1">{sos.texto_original_da_posologia}</p>
                <div className="mt-3 flex items-center gap-2">
                   <Info size={14} className="text-rose-400" />
                   <span className="text-[10px] font-black text-rose-700 uppercase">INDICAÇÃO: {sos.indicacao}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ASSINATURAS */}
      <footer className="mt-16 pt-8 border-t-2 border-slate-100">
        <div className="grid grid-cols-2 gap-12 text-center">
          <div>
            <div className="h-px bg-slate-300 w-48 mx-auto mb-2"></div>
            <p className="text-xs font-black text-teal-900">{receita.medico || 'MÉDICO RESPONSÁVEL'}</p>
            <p className="text-[10px] font-bold text-slate-400">REGISTRO: {receita.medico_id}</p>
          </div>
          <div>
            <div className="h-px bg-slate-300 w-48 mx-auto mb-2"></div>
            <p className="text-xs font-black text-teal-900">{receita.farmaceutico || 'FARMACÊUTICO RESPONSÁVEL'}</p>
            <p className="text-[10px] font-bold text-slate-400">REGISTRO: {receita.farmaceutico_id}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};