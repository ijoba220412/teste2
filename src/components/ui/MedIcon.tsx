'use client';
import React from 'react';
import { Pill, Droplets, FlaskConical, CircleDot } from 'lucide-react';

interface MedIconProps {
  apresentacao?: string;
  size?: number;
  className?: string;
}

// Ícone isolado do Medicamento
export const MedIcon = ({ apresentacao = '', size = 24, className = "" }: MedIconProps) => {
  const text = apresentacao.toLowerCase();
  
  if (text.includes('gota')) return <Droplets size={size} className={className} />;
  if (text.includes('cápsula') || text.includes('capsula')) return <Pill size={size} className={className} />;
  if (text.includes('meio') || text.includes('partido') || text.includes('1/2') || text.includes('0.5')) {
    return <CircleDot size={size} className={className} />; 
  }
  if (text.includes('xarope') || text.includes('líquido') || text.includes('liquido') || text.includes('frasco')) {
    return <FlaskConical size={size} className={className} />;
  }
  
  // Padrão: Comprimido Redondo (Diferente da Cápsula)
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" fill="none" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="6" y1="12" x2="18" y2="12" opacity="0.4" />
    </svg>
  );
};

// Renderizador Visual de Quantidade (Ex: 40 gotas, 2 comprimidos, 5mL)
export const VisualDose = ({ dose = '1', apresentacao = '' }: { dose?: string, apresentacao?: string }) => {
  const doseStr = dose.toLowerCase();
  
  // Extrai o número da string (ex: "40 gotas" -> 40)
  const numMatch = doseStr.match(/\d+/);
  const quantity = numMatch ? parseInt(numMatch[0]) : 1;
  
  const isGota = doseStr.includes('gota') || apresentacao.toLowerCase().includes('gota');
  const isMl = doseStr.includes('ml') || apresentacao.toLowerCase().includes('xarope') || apresentacao.toLowerCase().includes('liquido');
  const isCapsula = doseStr.includes('cap') || apresentacao.toLowerCase().includes('capsula');
  const isMeio = doseStr.includes('meio') || doseStr.includes('1/2') || doseStr.includes('0.5');

  if (isMl) {
    return (
      <div className="flex flex-col items-center justify-center text-teal-700 animate-in zoom-in">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" strokeWidth="2" className="mb-1">
          <path d="M6 4h12l-2 14H8z" />
          <path d="M8 10h8" opacity="0.3"/>
          <path d="M8 14h8" opacity="0.3"/>
        </svg>
        <span className="font-black text-[10px] leading-none bg-teal-50 px-1 rounded">{quantity} mL</span>
      </div>
    );
  }

  if (isGota) {
    // Desenha até 60 gotas. Para não quebrar o layout, elas quebram a linha automaticamente (flex-wrap)
    const drops = Array.from({ length: Math.min(quantity, 60) }); 
    return (
      <div className="flex flex-col items-center animate-in zoom-in">
        <div className="flex flex-wrap gap-[1px] justify-center items-center max-w-[60px]">
          {drops.map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" width="8" height="8" fill="currentColor" className="text-teal-500">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          ))}
        </div>
      </div>
    );
  }

  // Comprimidos / Cápsulas Múltiplas (Limite visual de 10 para não estourar a tela)
  const pills = Array.from({ length: Math.min(quantity, 10) });
  return (
    <div className="flex flex-wrap justify-center gap-1 max-w-[60px] animate-in zoom-in">
      {pills.map((_, i) => (
        <div key={i} className="text-teal-700">
          {isCapsula ? (
            <Pill size={20} />
          ) : isMeio ? (
            <CircleDot size={20} />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="6" y1="12" x2="18" y2="12" opacity="0.4" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};