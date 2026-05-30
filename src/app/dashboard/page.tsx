'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Prescription } from '@/types';
import Link from 'next/link';
import { Plus, FileText, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'prescriptions'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription)));
      } catch (e) { 
        console.error(e); 
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-teal-50 to-blue-50 p-8 sm:p-12 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4">
            Bem-vindo ao Receita Facilitada
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Transforme receitas médicas escritas em receitas visuais desenhadas, facilitando o entendimento de pacientes com dificuldade de leitura.
          </p>
          <Link
            href="/receitas/nova"
            className="inline-flex items-center gap-3 btn-primary"
          >
            <Plus className="h-6 w-6" /> Criar Nova Receita
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <FileText className="h-6 w-6 text-primary" /> Receitas Recentes
        </h3>
        
        {loading ? (
          <div className="text-center py-12">
            <Activity className="h-10 w-10 text-primary animate-pulse mx-auto" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
            <p className="text-slate-500 text-lg">Nenhuma receita cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((p) => (
              <Link
                key={p.id}
                href={`/receitas/imprimir/${p.id}`}
                className="group bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 hover:shadow-lg hover:ring-primary transition-all"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-teal-50 px-2 py-1 rounded">
                  Receita
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-3 group-hover:text-primary">
                  {p.patientName}
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  {p.medications?.length || 0} medicamentos
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
