/**
 * Utilitários de Máscaras e Formatação
 * Todas as funções retornam strings em UPPERCASE quando aplicável
 */

// Máscara para CPF: 000.000.000-00
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
    .toUpperCase();
}

// Máscara para CNPJ: 00.000.000/0000-00
export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .toUpperCase();
}

// Máscara para Telefone/Celular: (00) 00000-0000 ou (00) 0000-0000
export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
    .toUpperCase();
}

// Máscara para CEP: 00000-000
export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
    .toUpperCase();
}

// Máscara para Data: DD/MM/AAAA
export function maskDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1')
    .toUpperCase();
}

// Máscara para Horário: HH:MM
export function maskTime(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1:$2')
    .replace(/(:\d{2})\d+?$/, '$1')
    .toUpperCase();
}

// Conversor automático para UPPERCASE
export function toUpperCase(value: string): string {
  return value.toUpperCase();
}

// Hook utilitário para aplicar máscaras em inputs
export function useMask(maskFn: (value: string) => string) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const maskedValue = maskFn(e.target.value);
    onChange(maskedValue);
  };
  return { handleChange };
}
