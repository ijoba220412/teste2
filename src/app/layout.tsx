import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Pill, Users, Building2, ClipboardList, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SISTEMA MÉDICO - GESTÃO DE PRESCRIÇÕES",
  description: "GESTÃO COMPLETA DE RECEITAS E PACIENTES",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Instituições', href: '/instituicoes', icon: <Building2 size={20} /> },
    { label: 'Profissionais', href: '/profissionais', icon: <Users size={20} /> },
    { label: 'Pacientes', href: '/pacientes', icon: <Users size={20} /> },
    { label: 'Medicamentos', href: '/medicamentos', icon: <Pill size={20} /> },
    { label: 'Receitas', href: '/receitas', icon: <ClipboardList size={20} /> },
  ];

  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col md:flex-row uppercase`}>
        <ErrorBoundary>
          <ToastProvider>
            {/* SIDEBAR */}
            <aside className="w-full md:w-72 bg-teal-900 text-teal-50 p-6 flex flex-col shadow-2xl print:hidden">
              <div className="mb-10 px-2">
                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                  <Pill className="text-teal-400" /> MED<span className="text-teal-400">SYS</span>
                </h1>
                <p className="text-[10px] font-bold text-teal-400 mt-1">SISTEMA DE PRESCRIÇÃO V1.0</p>
              </div>
              
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-teal-800 transition-all font-bold text-sm"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}