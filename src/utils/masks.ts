// Máscara para Celular/Telefone: (99) 99999-9999 ou (99) 9999-9999
export const mascaraTelefone = (value: string) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})/, '$1-$2')
    .slice(0, 15);
};

// Máscara para CEP: 99999-999
export const mascaraCEP = (value: string) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

// Máscara para Data: DD/MM/AAAA
export const mascaraData = (value: string) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10);
};

// Máscara para CRM/CRF (Apenas números)
export const mascaraRegistro = (value: string) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};