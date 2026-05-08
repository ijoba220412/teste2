import React from 'react';
import { Pill, Tablet, AlertTriangle, Droplets } from 'lucide-react';

interface DosageImageProps {
  quantity: number;
  form: 'comprimido' | 'capsula' | 'mL';
}

export const DosageImage: React.FC<DosageImageProps> = ({ quantity, form }) => {
  // Validação para Cápsulas (Não podem ser fracionadas)
  if (form === 'capsula' && !Number.isInteger(quantity)) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-xs font-bold uppercase">QUANTIDADE INVÁLIDA PARA CÁPSULA</span>
      </div>
    );
  }

  const renderIcons = () => {
    const icons = [];
    const fullUnits = Math.floor(quantity);
    const hasHalf = quantity % 1 !== 0;

    for (let i = 0; i < (form === 'capsula' ? Math.round(quantity) : fullUnits); i++) {
      if (form === 'capsula') {
        icons.push(<Tablet key={`cap-${i}`} className="w-6 h-6 text-teal-700" />);
      } else if (form === 'comprimido') {
        icons.push(<Pill key={`pill-${i}`} className="w-6 h-6 text-teal-700" />);
      } else {
        icons.push(<Droplets key={`ml-${i}`} className="w-6 h-6 text-teal-700" />);
      }
    }

    if (hasHalf && form === 'comprimido') {
      icons.push(
        <div key="half" className="relative">
          <Pill className="w-6 h-6 text-teal-300" />
          <div className="absolute inset-0 border-t-2 border-red-500 rotate-45 top-1/2"></div>
        </div>
      );
    }

    return icons;
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {renderIcons()}
      <span className="ml-2 text-sm font-black text-teal-900 uppercase">
        {quantity} {form}
      </span>
    </div>
  );
};