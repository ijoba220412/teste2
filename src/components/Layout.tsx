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
  FileText
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const menu = [
    { href: '/', label: 'DASHBOARD', icon: Home },
    { href: '/pacientes', label: 'PACIENTES', icon: Users },
    { href: '/receitas', label: 'RECEITAS', icon: FileText },
    { href: '/receitas/nova', label: 'NOVA RECEITA', icon: Plus },
    { href: '/profissionais', label: 'PROFISSIONAIS', icon: Stethoscope },
    { href: '/instituicoes', label: 'INSTITUIÇÕES', icon: Building2 },
    { href: '/medicamentos', label: 'MEDICAMENTOS', icon: Pill },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-blue-900 border-b border-blue-800 shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-xl text-white">
              <Pill className="h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-wider">Receita Facilitada</h1>
          </Link>
          
          <nav className="flex items-center gap-1 flex-wrap">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold uppercase transition-all text-xs sm:text-sm ${
                    active 
                      ? 'bg-blue-700 text-white shadow-inner' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold uppercase">Receita Facilitada © {new Date().getFullYear()}</p>
          <p className="text-sm text-gray-400 uppercase mt-1">Sistema otimizado para impressão A4</p>
        </div>
      </footer>
    </div>
  );
}
