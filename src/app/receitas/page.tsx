'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Receita } from '@/types';
import Link from 'next/link';
import { Plus, FileText, Search, Printer, Trash2, Activity, AlertCircle } from 'lucide-react';

export default function ListagemReceitasPage() {
  const [receitas, setReceitas] = useState<Array<Receita & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Busca receitas em tempo real, ordenadas pela data de criação
  useEffect(() => {
    const q = query(collection(db, 'receitas'), orderBy('data_criacao', 'desc'));
    
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Array<Receita & { id: string }>;
        setReceitas(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar receitas:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('CONFIRMA EXCLUSÃO DESTA RECEITA?')) {
      try {
        await deleteDoc(doc(db, 'receitas', id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('ERRO AO EXCLUIR RECEITA');
      }
    }
  };

  // Função para formatar datas em DD/MM/AAAA
  const formatDate = (dateStr: string | any | undefined | null): string => {
    if (!dateStr) return '';
    
    // Se for string no formato DD/MM/AAAA
    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    
    // Se for string ISO (YYYY-MM-DD)
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.substring(0, 10).split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Se for objeto Timestamp do Firebase ou Date
    try {
      let date: Date;
      if (dateStr.toDate && typeof dateStr.toDate === 'function') {
        date = dateStr.toDate();
      } else {
        date = new Date(dateStr);
      }
      
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}
    
    return '';
  };

  // Filtro de busca por nome do paciente ou prontuário
  const filteredReceitas = receitas.filter(r => {
    const term = searchTerm.toUpperCase();
    return (
      r.nomePaciente?.toUpperCase().includes(term) ||
      r.prontuario?.toUpperCase().includes(term) ||
      r.medico?.toUpperCase().includes(term)
    );
  });

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-700" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
              LISTAGEM DE RECEITAS
            </h1>
          </div>
          
          <Link
            href="/receitas/nova"
            className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold uppercase transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" /> NOVA RECEITA
          </Link>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="BUSCAR POR PACIENTE, PRONTUÁRIO OU MÉDICO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase bg-white shadow-sm"
          />
        </div>

        {/* LISTA DE RECEITAS */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {filteredReceitas.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold uppercase">
                {searchTerm ? 'NENHUMA RECEITA ENCONTRADA PARA ESTA BUSCA' : 'NENHUMA RECEITA CADASTRADA'}
              </p>
              {!searchTerm && (
                <p className="text-gray-400 text-sm mt-2 uppercase">
                  CLIQUE EM "NOVA RECEITA" PARA COMEÇAR
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReceitas.map((r) => {
                const qtdFixos = r.medicamentos_fixos?.length || 0;
                const qtdSos = r.medicamentos_sos?.length || 0;
                const totalMeds = qtdFixos + qtdSos;
                
                return (
                  <div key={r.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      
                      {/* INFORMAÇÕES DA RECEITA */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900 uppercase">
                            {r.nomePaciente || 'PACIENTE SEM NOME'}
                          </h2>
                          {r.prontuario && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-bold uppercase">
                              PRONTUÁRIO: {r.prontuario}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 uppercase mb-3">
                          <p>
                            <span className="font-semibold text-gray-700">EMISSÃO:</span>{' '}
                            {formatDate(r.dataEmissao || r.data_criacao)}
                          </p>
                          {r.medico && (
                            <p>
                              <span className="font-semibold text-gray-700">MÉDICO:</span>{' '}
                              {r.medico}
                            </p>
                          )}
                          <p>
                            <span className="font-semibold text-gray-700">MEDICAMENTOS:</span>{' '}
                            {totalMeds} {totalMeds === 1 ? 'ITEM' : 'ITENS'}
                            {qtdFixos > 0 && ` (${qtdFixos} FIXO${qtdFixos > 1 ? 'S' : ''})`}
                            {qtdSos > 0 && ` (${qtdSos} SOS)`}
                          </p>
                        </div>

                        {/* TAGS DE TIPO */}
                        <div className="flex flex-wrap gap-2">
                          {qtdFixos > 0 && (
                            <span className="text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-bold uppercase">
                              USO CONTÍNUO
                            </span>
                          )}
                          {qtdSos > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold uppercase">
                              SOS
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AÇÕES */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/receitas/imprimir/${r.id}`}
                          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold uppercase transition-colors shadow-sm"
                        >
                          <Printer className="w-4 h-4" /> IMPRIMIR
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="EXCLUIR"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
