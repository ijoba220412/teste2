'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Prescription } from '@/types';
import Link from 'next/link';
import { Plus, FileText, Activity, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [prescriptions, setPrescriptions] = useState<Array<Prescription & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query ordenada por data de criação (campo real do Firestore: 'data_criacao')
    const q = query(
      collection(db, 'receitas'),
      orderBy('data_criacao', 'desc')
    );

    // onSnapshot para atualizações em tempo real com cleanup adequado
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const rawData = doc.data();
          
          // Mapeia estrutura real do Firestore (Receita) para estrutura do componente (Prescription)
          return {
            id: doc.id,
            // Dados do paciente
            patientName: rawData.nomePaciente || 'SEM NOME',
            patientRegistration: rawData.prontuario || '',
            patientBirthDate: rawData.data_nasc || '',
            patientAllergies: rawData.alergias || '',
            
            // Profissionais
            doctorName: rawData.medico || '',
            doctorCrm: rawData.medico_id || '',
            pharmacistName: rawData.farmaceutico || '',
            pharmacistCrf: rawData.farmaceutico_id || '',
            
            // Instituição
            institutionName: rawData.nomeInstituicao || '',
            
            // Medicamentos: converte medicamentos_fixos + medicamentos_sos para array único
            medications: [
              ...(rawData.medicamentos_fixos || []).map((m: any) => ({
                nome: m.nome || '',
                dosagem: m.texto_original_da_posologia || '',
                doseQuantity: 1,
                apresentacao: 'comprimido' as const,
                instrucoes: m.indicacao || '',
                tipo: 'continuo' as const
              })),
              ...(rawData.medicamentos_sos || []).map((m: any) => ({
                nome: m.nome || '',
                dosagem: m.texto_original_da_posologia || '',
                doseQuantity: 1,
                apresentacao: 'comprimido' as const,
                instrucoes: m.indicacao || '',
                tipo: 'sos' as const
              }))
            ],
            
            // Datas: converte string ou Timestamp para formato compatível
            createdAt: rawData.data_criacao 
              ? { 
                  toDate: () => new Date(rawData.data_criacao),
                  toMillis: () => new Date(rawData.data_criacao).getTime()
                }
              : undefined,
            updatedAt: rawData.data_atualizacao
              ? { 
                  toDate: () => new Date(rawData.data_atualizacao),
                  toMillis: () => new Date(rawData.data_atualizacao).getTime()
                }
              : undefined,
            prescriptionDate: rawData.dataEmissao || '',
            
            // Metadados
            tipo: rawData.tipo || 'ambos',
            observacoes: rawData.observacoes || '',
            status: 'ativa' as const
          } as Prescription & { id: string };
        });
        
        setPrescriptions(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erro ao carregar receitas:', err);
        setError('ERRO AO CARREGAR RECEITAS');
        setLoading(false);
      }
    );

    // Cleanup para evitar memory leaks
    return () => unsub();
  }, []);

  // Formata data para exibição (DD/MM/AAAA)
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    
    let date: Date;
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold uppercase">CARREGANDO RECEITAS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold uppercase mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="rounded-3xl bg-gradient-to-br from-teal-50 to-blue-50 p-6 sm:p-10 shadow-sm border border-teal-100">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 uppercase">
              BEM-VINDO AO RECEITA FACILITADA
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-3 uppercase">
              TRANSFORME RECEITAS MÉDICAS EM RECEITAS VISUAIS, FACILITANDO O ENTENDIMENTO DE PACIENTES.
            </p>
            <Link
              href="/receitas/nova"
              className="inline-flex items-center gap-3 mt-6 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              CRIAR NOVA RECEITA
            </Link>
          </div>
        </div>

        {/* LISTA DE RECEITAS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-teal-700" />
            <h2 className="text-2xl font-bold text-gray-900 uppercase">RECEITAS RECENTES</h2>
          </div>
          
          {prescriptions.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-gray-200 bg-white">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold uppercase">
                NENHUMA RECEITA CADASTRADA AINDA
              </p>
              <p className="text-gray-400 text-sm mt-2 uppercase">
                CLIQUE EM "CRIAR NOVA RECEITA" PARA COMEÇAR
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prescriptions.map((p) => (
                <Link
                  key={p.id}
                  href={`/receitas/imprimir/${p.id}`}
                  className="group bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-teal-300 hover:border-teal-300 transition-all cursor-pointer"
                >
                  {/* TAG DE TIPO */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      p.tipo === 'continuo' 
                        ? 'bg-teal-100 text-teal-800' 
                        : p.tipo === 'sos'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.tipo === 'continuo' ? 'USO CONTÍNUO' : p.tipo === 'sos' ? 'SOS' : 'MISTO'}
                    </span>
                    
                    {/* DATA */}
                    <span className="text-xs text-gray-400 font-medium uppercase">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>
                  
                  {/* NOME DO PACIENTE */}
                  <h3 className="text-lg font-bold text-gray-900 uppercase group-hover:text-teal-700 transition-colors">
                    {p.patientName}
                  </h3>
                  
                  {/* PRONTUÁRIO */}
                  {p.patientRegistration && (
                    <p className="text-sm text-gray-500 mt-1 uppercase">
                      PRONTUÁRIO: {p.patientRegistration}
                    </p>
                  )}
                  
                  {/* CONTAGEM DE MEDICAMENTOS */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-sm text-gray-600 font-semibold uppercase">
                      {p.medications?.length || 0} MEDICAMENTO(S)
                    </span>
                    
                    {/* INDICADOR DE ALERGIAS */}
                    {p.patientAllergies && p.patientAllergies.trim() !== '' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium uppercase">
                        ALERGIAS
                      </span>
                    )}
                  </div>
                  
                  {/* MÉDICO RESPONSÁVEL */}
                  {p.doctorName && (
                    <p className="text-xs text-gray-400 mt-3 uppercase border-t border-gray-100 pt-3">
                      DR(A). {p.doctorName}
                      {p.doctorCrm && ` — ${p.doctorCrm}`}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RODAPÉ INFORMATIVO */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-400 uppercase">
            SISTEMA ABERTO PARA DEMONSTRAÇÃO • SEM AUTENTICAÇÃO
          </p>
        </div>
        
      </div>
    </div>
  );
}
