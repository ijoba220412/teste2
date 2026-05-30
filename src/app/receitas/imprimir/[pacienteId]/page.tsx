'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita, Instituicao, Profissional } from '@/types';
import { MEDICATION_ICONS } from '@/utils/generateHorarios';
import { Printer, ArrowLeft, AlertCircle, Building2, User, Stethoscope } from 'lucide-react';

export default function ImprimirReceita() {
  const params = useParams();
  // O parâmetro da URL é [pacienteId] mas na verdade representa o ID da receita
  const receitaId = params?.pacienteId as string;
  const router = useRouter();
  
  const [receita, setReceita] = useState<(Receita & { id: string }) | null>(null);
  const [instituicao, setInstituicao] = useState<(Instituicao & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para formatar datas em DD/MM/AAAA
  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    
    // Se já estiver em DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    
    // Se estiver em YYYY-MM-DD (ISO)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.substring(0, 10).split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Tenta parsear como Date
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}
    
    return dateStr;
  };

  useEffect(() => {
    (async () => {
      if (receitaId) {
        try {
          const snap = await getDoc(doc(db, 'receitas', receitaId));
          if (snap.exists()) {
            const data = { id: snap.id, ...snap.data() } as Receita & { id: string };
            setReceita(data);
            
            // Busca dados da instituição se houver ID
            if (data.instituicaoId) {
              const instSnap = await getDoc(doc(db, 'instituicoes', data.instituicaoId));
              if (instSnap.exists()) {
                setInstituicao({ id: instSnap.id, ...instSnap.data() } as Instituicao & { id: string });
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

  const print = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold uppercase text-lg">CARREGANDO RECEITA...</p>
        </div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 text-xl font-bold uppercase mb-4">RECEITA NÃO ENCONTRADA</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> VOLTAR AO INÍCIO
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Separar medicamentos para exibição
  const medicamentos_fixos = receita.medicamentos_fixos || [];
  const medicamentos_sos = receita.medicamentos_sos || [];
  const temMedicamentos = medicamentos_fixos.length > 0 || medicamentos_sos.length > 0;

  // Determina a instituição a exibir (preferência: buscada pelo ID, depois o nome gravado na receita)
  const nomeInstituicao = instituicao?.nome || receita.nomeInstituicao || 'INSTITUIÇÃO';
  const descricaoInstituicao = instituicao?.descricao || '';
  const enderecoInstituicao = instituicao ? (
    `${instituicao.rua || ''}, ${instituicao.numero || ''}${instituicao.complemento ? ` - ${instituicao.complemento}` : ''} - ${instituicao.bairro || ''}, ${instituicao.cidade || ''}/${instituicao.uf || ''} - CEP: ${instituicao.cep || ''}`
  ) : '';
  const telefoneInstituicao = instituicao?.telefone1 || '';

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:bg-white print:p-0">
      
      {/* BOTÕES DE AÇÃO (não aparecem na impressão) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 print:hidden">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center gap-2 px-5 py-3 border-2 border-teal-700 text-teal-700 rounded-xl hover:bg-teal-50 transition-colors uppercase font-semibold"
        >
          <ArrowLeft className="w-5 h-5" /> VOLTAR
        </button>
        <button 
          onClick={print} 
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl transition-colors uppercase font-semibold shadow-lg"
        >
          <Printer className="w-5 h-5" /> IMPRIMIR / PDF
        </button>
      </div>

      {/* RECEITA - ÁREA IMPRIMÍVEL */}
      <div 
        id="printable-receipt" 
        className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none"
        style={{ 
          fontFamily: 'Arial, sans-serif',
          padding: '40px',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact'
        }}
      >
        
        {/* ========== CABEÇALHO DA INSTITUIÇÃO ========== */}
        <header className="text-center border-b-4 border-teal-700 pb-6 mb-6">
          <div className="flex justify-center mb-2">
            <Building2 className="w-12 h-12 text-teal-700" />
          </div>
          <h1 className="text-3xl font-extrabold text-teal-800 uppercase tracking-wide">
            {nomeInstituicao}
          </h1>
          {descricaoInstituicao && (
            <p className="text-base text-gray-700 mt-1 uppercase font-semibold">
              {descricaoInstituicao}
            </p>
          )}
          {enderecoInstituicao && (
            <p className="text-xs text-gray-600 mt-2 uppercase">
              {enderecoInstituicao}
            </p>
          )}
          {telefoneInstituicao && (
            <p className="text-xs text-gray-600 uppercase">
              TEL: {telefoneInstituicao}
            </p>
          )}
        </header>

        {/* ========== TÍTULO DA RECEITA ========== */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">
            RECEITA MÉDICA FACILITADA
          </h2>
          <div className="w-32 h-1 bg-teal-700 mx-auto mt-2"></div>
        </div>

        {/* ========== DADOS DO PACIENTE ========== */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-teal-800" />
            <h3 className="text-sm font-bold text-teal-900 uppercase">DADOS DO PACIENTE</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="font-bold text-gray-700 uppercase block text-xs">PACIENTE:</span>
              <span className="font-semibold text-gray-900 uppercase">{receita.nomePaciente}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700 uppercase block text-xs">PRONTUÁRIO:</span>
              <span className="font-semibold text-gray-900 uppercase">{receita.prontuario}</span>
            </div>
            <div>
              <span className="font-bold text-gray-700 uppercase block text-xs">DATA DE NASCIMENTO:</span>
              <span className="font-semibold text-gray-900 uppercase">
                {formatDate(receita.data_nasc)}
              </span>
            </div>
          </div>
          
          {/* ALERGIAS - Destaque vermelho se houver */}
          <div className="mt-3 pt-3 border-t border-teal-200">
            <span className="font-bold text-gray-700 uppercase block text-xs mb-1">ALERGIAS:</span>
            {receita.alergias || receita.pacienteAllergies ? (
              <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
                <span className="font-bold text-red-800 uppercase text-sm">
                  {(receita.alergias || receita.pacienteAllergies || '').toUpperCase()}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-gray-700 uppercase">NEGA ALERGIAS</span>
            )}
          </div>
        </div>

        {/* ========== MÉDICO PRESCRITOR ========== */}
        {(receita.medico || receita.medico_id) && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-gray-800 uppercase">MÉDICO PRESCRITOR</h3>
            </div>
            <p className="font-bold text-gray-900 uppercase">
              DR(A). {receita.medico}
              {receita.medico_id && (
                <span className="text-sm text-gray-600 font-normal ml-2">
                  — {receita.medico_id}
                </span>
              )}
            </p>
          </div>
        )}

        {/* ========== CORPO DA RECEITA ========== */}
        <div className="space-y-6">
          
          {/* SEÇÃO: USO CONTÍNUO */}
          {medicamentos_fixos.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4 border-b-2 border-teal-700 pb-2">
                <div className="w-2 h-8 bg-teal-700"></div>
                <h3 className="text-lg font-extrabold text-teal-800 uppercase tracking-wide">
                  MEDICAMENTOS DE USO CONTÍNUO
                </h3>
              </div>
              
              <div className="space-y-4">
                {medicamentos_fixos.map((med: any, idx: number) => (
                  <div 
                    key={`fixo-${idx}`} 
                    className="border-2 border-gray-200 rounded-xl p-4 bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <h4 className="text-xl font-bold text-gray-900 uppercase flex-1">
                        {med.nome?.toUpperCase() || 'MEDICAMENTO'}
                      </h4>
                      <span className="bg-teal-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
                        CONTÍNUO
                      </span>
                    </div>
                    
                    <p className="text-base text-gray-800 uppercase mb-3 font-semibold">
                      {med.texto_original_da_posologia?.toUpperCase() || ''}
                    </p>
                    
                    {med.indicacao && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-xs font-bold text-blue-900 uppercase mb-1">PARA QUE SERVE:</p>
                        <p className="text-sm text-blue-800 uppercase">{med.indicacao.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO: SOS */}
          {medicamentos_sos.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4 border-b-2 border-amber-600 pb-2">
                <div className="w-2 h-8 bg-amber-600"></div>
                <h3 className="text-lg font-extrabold text-amber-800 uppercase tracking-wide">
                  MEDICAMENTOS SOS (SE NECESSÁRIO)
                </h3>
              </div>
              
              <div className="space-y-4">
                {medicamentos_sos.map((med: any, idx: number) => (
                  <div 
                    key={`sos-${idx}`} 
                    className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <h4 className="text-xl font-bold text-gray-900 uppercase flex-1">
                        {med.nome?.toUpperCase() || 'MEDICAMENTO'}
                      </h4>
                      <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
                        SOS
                      </span>
                    </div>
                    
                    <p className="text-base text-gray-800 uppercase mb-3 font-semibold">
                      {med.texto_original_da_posologia?.toUpperCase() || 'USO SOB DEMANDA'}
                    </p>
                    
                    {med.indicacao && (
                      <div className="bg-white border-l-4 border-amber-500 p-3 rounded">
                        <p className="text-xs font-bold text-amber-900 uppercase mb-1">INDICAÇÃO:</p>
                        <p className="text-sm text-gray-800 uppercase">{med.indicacao.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVISO SE NÃO HOUVER MEDICAMENTOS */}
          {!temMedicamentos && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 font-semibold uppercase">
                NENHUM MEDICAMENTO PRESCRITO NESTA RECEITA
              </p>
            </div>
          )}
        </div>

        {/* ========== OBSERVAÇÕES ========== */}
        {receita.observacoes && (
          <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
            <p className="text-xs font-bold text-yellow-900 uppercase mb-1">OBSERVAÇÕES:</p>
            <p className="text-sm text-gray-800 uppercase">{String(receita.observacoes).toUpperCase()}</p>
          </div>
        )}

        {/* ========== RODAPÉ - ASSINATURAS ========== */}
        <footer className="mt-12 pt-6 border-t-2 border-gray-300">
          
          {/* Data de emissão */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-700 uppercase">
              <span className="font-bold">DATA DE EMISSÃO:</span>{' '}
              {formatDate(receita.dataEmissao) || formatDate(receita.data_criacao?.toString()) || formatDate(new Date().toISOString())}
            </p>
          </div>
          
          {/* Linhas de assinatura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t-2 border-gray-800 pt-2 mx-4">
                <p className="font-bold text-gray-900 uppercase text-sm">
                  {receita.medico || 'MÉDICO(A) RESPONSÁVEL'}
                </p>
                <p className="text-xs text-gray-600 uppercase">
                  {receita.medico_id || 'CRM/UF'}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="border-t-2 border-gray-800 pt-2 mx-4">
                <p className="font-bold text-gray-900 uppercase text-sm">
                  {receita.farmaceutico || 'FARMACÊUTICO(A) RESPONSÁVEL'}
                </p>
                <p className="text-xs text-gray-600 uppercase">
                  {receita.farmaceutico_id || 'CRF/UF'}
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé informativo */}
          <div className="mt-10 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600 uppercase font-semibold">
              RECEITA FACILITADA — SEGURANÇA E CLAREZA PARA TODOS
            </p>
            <p className="text-xs text-gray-500 uppercase mt-1">
              EM CASO DE DÚVIDAS, PROCURE SEU FARMACÊUTICO OU MÉDICO.
            </p>
            {nomeInstituicao && (
              <p className="text-xs text-gray-500 uppercase mt-2">
                {nomeInstituicao.toUpperCase()}
                {enderecoInstituicao && ` • ${enderecoInstituicao.toUpperCase()}`}
              </p>
            )}
          </div>
        </footer>

      </div>

      {/* ESTILOS DE IMPRESSÃO */}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-receipt {
            box-shadow: none !important;
            max-width: 100% !important;
            page-break-inside: avoid;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
