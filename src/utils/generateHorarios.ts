import { MealIcon } from '@/types';

export const MEDICATION_ICONS: Record<string, string> = {
  comprimido: '/img/n/f/comprimido.png',
  capsula: '/img/n/f/capsula.png',
  gota: '/img/n/f/gota.png',
  liquido: '/img/n/f/liquido.png',
  xarope: '/img/n/f/xarope.png',
  spray: '/img/n/f/spray.png',
  pomada: '/img/n/f/pomada.png',
};

export const MEAL_ICONS: Record<string, { icon: string; label: string }> = {
  '05:00-09:00': { icon: '/img/n/f/cafe.png', label: 'Café da Manhã' },
  '09:00-11:00': { icon: '/img/n/f/lanche.png', label: 'Lanche da Manhã' },
  '11:00-14:00': { icon: '/img/n/f/almoco.png', label: 'Almoço' },
  '14:00-17:00': { icon: '/img/n/f/lanche.png', label: 'Lanche da Tarde' },
  '17:00-20:00': { icon: '/img/n/f/jantar.png', label: 'Jantar' },
  '20:00-05:00': { icon: '/img/n/f/dormir.png', label: 'Antes de Dormir' },
};

export function getMealIcon(hour: string): { icon: string; label: string } {
  const h = parseInt(hour.split(':')[0]);
  if (h >= 5 && h < 9) return MEAL_ICONS['05:00-09:00'];
  if (h >= 9 && h < 11) return MEAL_ICONS['09:00-11:00'];
  if (h >= 11 && h < 14) return MEAL_ICONS['11:00-14:00'];
  if (h >= 14 && h < 17) return MEAL_ICONS['14:00-17:00'];
  if (h >= 17 && h < 20) return MEAL_ICONS['17:00-20:00'];
  return MEAL_ICONS['20:00-05:00'];
}

export function calculateHours(startHour: string, frequency: number): string[] {
  if (frequency <= 0 || frequency > 12) {
    frequency = 2;
  }
  
  const interval = Math.floor(24 / frequency);
  const [startH, startM] = startHour.split(':').map(Number);
  const hours: string[] = [];
  
  for (let i = 0; i < frequency; i++) {
    const totalMinutes = startH * 60 + startM + i * interval * 60;
    const h = Math.floor((totalMinutes / 60) % 24);
    const m = totalMinutes % 60;
    hours.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  
  return hours;
}

export function generateMealIcons(hours: string[]): MealIcon[] {
  return hours.map(hour => ({
    hour,
    ...getMealIcon(hour),
  }));
}
