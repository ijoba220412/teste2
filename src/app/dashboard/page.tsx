'use client';
import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Activity, Users, ClipboardList, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Pacientes Ativos', value: '124', icon: <Users />, color: 'bg-blue-500' },
    { label: 'Receitas Emitidas', value: '458', icon: <ClipboardList />, color: 'bg-teal-600' },
    { label: 'Alergias Críticas', value: '12', icon: <AlertCircle />, color: 'bg-red-500' },
    { label: 'Atendimentos Hoje', value: '18', icon: <Activity />, color: 'bg-cyan-600' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-teal-900 uppercase">Visão Geral do Sistema</h1>
        <p className="text-slate-500 font-bold">BEM-VINDO AO PAINEL DE CONTROLE MÉDICO</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-4 rounded-xl text-white ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Atividades Recentes" subtitle="ÚLTIMAS RECEITAS GERADAS" />
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-l-4 border-teal-500">
                <div>
                  <p className="font-black text-teal-900">MARLI FERREIRA</p>
                  <p className="text-xs text-slate-500">PRONTUÁRIO: 5208248</p>
                </div>
                <span className="text-xs font-bold bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                  30/04/2026
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Alertas de Segurança" subtitle="MEDICAMENTOS SOS RECORRENTES" />
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Activity size={48} className="mb-2 opacity-20" />
            <p className="font-bold text-sm uppercase">Nenhum alerta crítico detectado</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
