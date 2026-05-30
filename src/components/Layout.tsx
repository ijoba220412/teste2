'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  Users, 
  Pill, 
  Building2, 
  Stethoscope,
  Printer
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const menu = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/receitas/nova', label: 'Nova Receita', icon: Plus },
    { href: '/pacientes', label: 'Pacientes', icon: Users },
    { href: '/medicamentos', label: 'Medicamentos', icon: Pill },
    { href: '/profissionais', label: 'Profissionais', icon: Stethoscope },
    { href: '/instituicoes', label: 'Instituições', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl text-white">
              <Pill className="h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Receita Facilitada</h1>
          </Link>
          
          <nav className="flex items-center gap-2 flex-wrap">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                    active 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
