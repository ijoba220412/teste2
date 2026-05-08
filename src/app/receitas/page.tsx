// src/app/receitas/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ClipboardList, 
  Search, 
  Printer, 
  Calendar, 
  User, 
  Hash, 
  ChevronRight,
  FileText,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function ListagemReceitasPage() {
  const { data: receitas, loading, list } = useFirestore<any>('receitas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = list();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Filtro de busca por nome ou prontuário
  const receitasFiltradas = receitas.filter((r: any) => {
    const nome = r.nomePaciente?.toLowerCase() || '';
    const prontuario = r.prontuario?.toString() || '';
    const busca = searchTerm.toLowerCase();
    return nome.includes(busca) || prontuario.includes(busca);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] uppercase font-black text-teal-800 gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-700"></div>
        <span>Carregando Prescrições...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CABEÇALHO DA PÁGINA */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-teal-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-teal-900 uppercase tracking-tighter flex items-center gap-3">
            <ClipboardList className="text-teal-600" size={32} />
            Gestão de Receitas
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs mt-1">Consulte e imprima as prescrições facilitadas</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Link href="/receitas/nova">
            <Button className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-4 shadow-lg rounded-xl flex gap-2">
              <FileText size={20} /> NOVA PRESCRIÇÃO
            </Button>
          </Link>
        </div>
      </header>

      {/* BARRA DE BUSCA */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
        </div>
        <input 
          type="text"
          placeholder="BUSCAR POR NOME DO PACIENTE OU NÚMERO DO PRONTUÁRIO..."
          className="w-full pl-12 pr-4 py-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-teal-500 outline-none uppercase font-bold text-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTAGEM EM CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {receitasFiltradas.length > 0 ? (
          receitasFiltradas.map((receita: any) => (
            <Card key={receita.id} className="group hover:border-teal-500 transition-all border-2 border-transparent shadow-md hover:shadow-xl overflow-hidden p-0">
              <div className="flex flex-col md:flex-row items-stretch md:items-center">
                
                {/* INFO PRINCIPAL */}
                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="bg-teal-50 p-4 rounded-2xl text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <User size={28} />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 uppercase leading-none tracking-tight">
                      {receita.nomePaciente || 'PACIENTE SEM NOME'}
                    </h3>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                        <Hash size={12} className="text-teal-500" /> Prontuário: <span className="text-slate-800">{receita.prontuario || 'N/I'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                        <Calendar size={12} className="text-teal-500" /> Emissão: <span className="text-slate-800">{receita.dataEmissao || receita.data_criacao || '--/--/--'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="bg-slate-50 md:bg-transparent p-4 md:p-6 border-t md:border-t-0 md:border-l border-slate-100 flex gap-2">
                  
                  {/* Link dinâmico usando o ID do Firebase */}
                  <Link href={`/receitas/imprimir/${receita.id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" className="w-full flex gap-2 border-2 border-teal-700 text-teal-700 font-black hover:bg-teal-50 rounded-xl px-6 py-3">
                      <Printer size={18} /> IMPRIMIR VISUAL
                    </Button>
                  </Link>

                  <Link href={`/receitas/editar/${receita.id}`}>
                    <Button variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-3 rounded-xl flex items-center justify-center">
                      <ChevronRight size={20} />
                    </Button>
                  </Link>
                </div>

              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center gap-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Filter size={48} className="text-slate-200" />
            <p className="text-slate-400 font-black uppercase tracking-widest">Nenhuma receita encontrada para essa busca</p>
          </div>
        )}
      </div>
    </div>
  );
}