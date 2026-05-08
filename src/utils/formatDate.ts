/**
 * FORMATA DATA PARA EXIBIÇÃO NO PADRÃO BRASILEIRO DD/MM/AAAA
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  
  // Caso a string já venha formatada ou ISO
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day && year.length === 4) {
      return `${day}/${month}/${year}`;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback

    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  } catch (e) {
    return dateString;
  }
}

/**
 * CONVERTE DD/MM/AAAA PARA YYYY-MM-DD (PARA INPUT DATE)
 */
export function formatDateToInput(dateString: string | undefined): string {
  if (!dateString) return '';
  if (dateString.includes('-')) return dateString;
  
  const [day, month, year] = dateString.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
}