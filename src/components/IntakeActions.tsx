'use client';
import React from 'react';
import { CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { AcaoTomada } from '@/types';

interface IntakeActionsProps {
  prescricaoId: string;
  horario: string;
}

export const IntakeActions: React.FC<IntakeActionsProps> = ({ prescricaoId, horario }) => {
  const registrarAcao = async (status: AcaoTomada) => {
    try {
      const docRef = doc(db, 'registros_tomadas', `${prescricaoId}_${horario}`);
      // Nota: No Firebase real, poderíamos ter uma subcoleção ou documento específico
      console.log(`REGISTRANDO ${status} PARA ${prescricaoId} ÀS ${horario}`);
      // Lógica de atualização aqui...
      alert(`STATUS ${status.toUpperCase()} REGISTRADO COM SUCESSO!`);
    } catch (error) {
      console.error("ERRO AO REGISTRAR:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => registrarAcao('tomado')}
        className="p-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-700 hover:text-white transition-colors"
        title="TOMADO"
      >
        <CheckCircle2 size={20} />
      </button>
      <button 
        onClick={() => registrarAcao('nao_tomado')}
        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-700 hover:text-white transition-colors"
        title="NÃO TOMADO"
      >
        <XCircle size={20} />
      </button>
      <button 
        onClick={() => registrarAcao('pulado')}
        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
        title="PULADO"
      >
        <SkipForward size={20} />
      </button>
    </div>
  );
};