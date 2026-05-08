/**
 * GERA ARRAY DE HORÁRIOS BASEADO EM FREQUÊNCIA
 */
export function generateHorarios(horaInicio: string, intervaloHoras: number): string[] {
  const horarios: string[] = [];
  let [hours, minutes] = horaInicio.split(':').map(Number);

  const totalVezesAoDia = Math.floor(24 / intervaloHoras);

  for (let i = 0; i < totalVezesAoDia; i++) {
    const h = String(hours % 24).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    horarios.push(`${h}:${m}`);
    hours += intervaloHoras;
  }

  return horarios.sort();
}