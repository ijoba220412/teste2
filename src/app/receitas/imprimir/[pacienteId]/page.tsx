'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Prescription } from '@/types';
import { MEDICATION_ICONS } from '@/utils/generateHorarios';
import { Printer, ArrowLeft } from 'lucide-react';

export default function ImprimirReceita() {
  const { pacienteId } = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (pacienteId) {
        const snap = await getDoc(doc(db, 'prescriptions', pacienteId as string));
        if (snap.exists()) {
          setPrescription({ id: snap.id, ...snap.data() } as Prescription);
        }
      }
      setLoading(false);
    })();
  }, [pacienteId]);

  const print = () => window.print();

  if (loading) {
    return (
      <div className="text-center py-12 text-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        Carregando receita...
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">Receita não encontrada</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn-primary mt-4"
        >
          <ArrowLeft /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 no-print">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="btn-secondary"
        >
          <ArrowLeft /> Voltar
        </button>
        <button 
          onClick={print} 
          className="btn-primary"
        >
          <Printer /> Imprimir / PDF
        </button>
      </div>

      <div id="printable-receipt" className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 border-4 border-primary">
        <header className="text-center border-b-2 border-primary pb-6 mb-8">
          <h1 className="text-4xl font-extrabold text-primary">Receita Facilitada</h1>
          <p className="text-xl text-slate-700 mt-2">
            Paciente: <strong>{prescription.patientName}</strong>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Emitida em: {prescription.createdAt?.toDate 
              ? prescription.createdAt.toDate().toLocaleDateString('pt-BR') 
              : new Date().toLocaleDateString('pt-BR')}
          </p>
        </header>

        <div className="space-y-8">
          {prescription.medications.map((med, idx) => (
            <div key={idx} className="border-2 border-slate-200 rounded-2xl p-6 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{med.nome}</h2>
                <span className="text-sm bg-primary text-white px-3 py-1 rounded-full font-bold">
                  {med.dosagem}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">
                  Tomar a cada dose:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: med.doseQuantity }).map((_, i) => (
                    <img 
                      key={i}
                      src={MEDICATION_ICONS[med.apresentacao] || MEDICATION_ICONS.comprimido} 
                      alt={med.apresentacao}
                      className="w-12 h-12 object-contain"
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">
                  Horários do dia:
                </p>
                <div className="flex flex-wrap gap-3">
                  {med.mealIcons?.map((mi, i) => (
                    <div key={i} className="bg-white rounded-xl px-4 py-3 shadow border-2 border-teal-200 flex items-center gap-2">
                      <img 
                        src={mi.icon} 
                        alt={mi.label}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{mi.label}</p>
                        <p className="text-sm text-slate-500">{mi.hour}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {med.symptoms && med.symptoms.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">
                    Para que serve:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {med.symptoms.map((symptom, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow border-2 border-teal-200 text-center">
                        <img 
                          src={`/img/n/f/${symptom.file}`} 
                          alt={symptom.name}
                          className="w-16 h-16 object-contain mx-auto mb-1"
                        />
                        <p className="text-xs font-bold text-slate-700">{symptom.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t-2 border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Receita Facilitada — Segurança e clareza para todos
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Em caso de dúvidas, procure seu farmacêutico ou médico.
          </p>
        </footer>
      </div>
    </div>
  );
}
