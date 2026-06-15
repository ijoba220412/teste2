'use client';

import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';

export default function Dashboard() {
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
          </div>
        </div>

        {/* ESTATÍSTICAS */}
        <DashboardStats />

        {/* AÇÕES RÁPIDAS */}
        <QuickActions />
        
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
