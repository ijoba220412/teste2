'use client';

import React from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  ClipboardDocumentListIcon, 
  PlusCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const quickActions = [
  {
    title: 'NOVO PACIENTE',
    href: '/pacientes/novo',
    icon: UserPlusIcon,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Cadastrar novo paciente no sistema'
  },
  {
    title: 'NOVA RECEITA',
    href: '/receitas/nova',
    icon: ClipboardDocumentListIcon,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Criar nova prescrição médica'
  },
  {
    title: 'PROFISSIONAIS',
    href: '/profissionais',
    icon: AcademicCapIcon,
    color: 'bg-purple-600 hover:bg-purple-700',
    description: 'Gerenciar equipe de saúde'
  },
  {
    title: 'INSTITUIÇÕES',
    href: '/instituicoes',
    icon: BuildingOfficeIcon,
    color: 'bg-red-600 hover:bg-red-700',
    description: 'Hospitais, clínicas e UBS'
  },
  {
    title: 'PACIENTES',
    href: '/pacientes',
    icon: UserGroupIcon,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    description: 'Lista completa de pacientes'
  },
  {
    title: 'RECEITAS',
    href: '/receitas',
    icon: ArrowTrendingUpIcon,
    color: 'bg-yellow-600 hover:bg-yellow-700',
    description: 'Histórico de prescrições'
  },
];

export default function QuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-black text-gray-800 uppercase mb-6 flex items-center gap-2">
        <PlusCircleIcon className="w-8 h-8 text-blue-600" />
        ACESSO RÁPIDO
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`${action.color} text-white p-6 rounded-xl shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-200 flex flex-col items-center text-center group`}
          >
            <action.icon className="w-16 h-16 mb-4 opacity-90 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xl font-black uppercase tracking-wide">{action.title}</h3>
            <p className="text-sm mt-2 opacity-90 font-medium">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
