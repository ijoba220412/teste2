'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Stats {
  totalPacientes: number;
  totalReceitas: number;
  receitasHoje: number;
  totalProfissionais: number;
  totalInstituicoes: number;
  totalMedicamentos: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalPacientes: 0,
    totalReceitas: 0,
    receitasHoje: 0,
    totalProfissionais: 0,
    totalInstituicoes: 0,
    totalMedicamentos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Contar Pacientes
      const pacientesSnap = await getDocs(collection(db, 'pacientes'));
      
      // Contar Receitas
      const receitasSnap = await getDocs(collection(db, 'receitas'));
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const receitasHojeCount = receitasSnap.docs.filter(doc => {
        const data = doc.data().dataCriacao?.toDate();
        return data && data >= hoje;
      }).length;

      // Contar Profissionais
      const profissionaisSnap = await getDocs(collection(db, 'profissionais'));
      
      // Contar Instituições
      const instituicoesSnap = await getDocs(collection(db, 'instituicoes'));
      
      // Contar Medicamentos
      const medicamentosSnap = await getDocs(collection(db, 'medicamentos_padrao'));

      setStats({
        totalPacientes: pacientesSnap.size,
        totalReceitas: receitasSnap.size,
        receitasHoje: receitasHojeCount,
        totalProfissionais: profissionaisSnap.size,
        totalInstituicoes: instituicoesSnap.size,
        totalMedicamentos: medicamentosSnap.size,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    { title: 'PACIENTES CADASTRADOS', value: stats.totalPacientes, color: 'bg-blue-500', icon: '👥' },
    { title: 'RECEITAS GERADAS', value: stats.totalReceitas, color: 'bg-green-500', icon: '📄' },
    { title: 'RECEITAS HOJE', value: stats.receitasHoje, color: 'bg-yellow-500', icon: '📅' },
    { title: 'PROFISSIONAIS', value: stats.totalProfissionais, color: 'bg-purple-500', icon: '👨‍⚕️' },
    { title: 'INSTITUIÇÕES', value: stats.totalInstituicoes, color: 'bg-red-500', icon: '🏥' },
    { title: 'MEDICAMENTOS', value: stats.totalMedicamentos, color: 'bg-indigo-500', icon: '💊' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase opacity-90">{stat.title}</p>
              <p className="text-4xl font-black mt-2">{stat.value}</p>
            </div>
            <div className="text-5xl opacity-75">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
