import { z } from 'zod';

// SCHEMA DE PACIENTE
export const PacienteSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  dataNascimento: z.string().min(10, 'Data inválida'),
  matricula: z.string().min(1, 'Matrícula obrigatória'),
  alergias: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  historico: z.string().optional(),
  instituicaoId: z.string().optional(),
  profissionalId: z.string().optional()
});

// SCHEMA DE PROFISSIONAL
export const ProfissionalSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cargo: z.enum(['Médico(a)', 'Farmacêutico(a)', 'Outro']),
  cargoOutro: z.string().optional(),
  numeroRegistro: z.string().min(1, 'Número de registro obrigatório'),
  orgao: z.enum(['CRM', 'CRF', 'COREM', 'OUTRO']),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  especialidade: z.string().optional(),
  local: z.string().optional(),
  observacoes: z.string().optional()
});

// SCHEMA DE INSTITUIÇÃO
export const InstituicaoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  rua: z.string().min(1, 'Rua obrigatória'),
  numero: z.string().min(1, 'Número obrigatório'),
  bairro: z.string().min(1, 'Bairro obrigatório'),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido'),
  telefone1: z.string().min(1, 'Telefone obrigatório'),
  telefone2: z.string().optional(),
  tipo: z.string().min(1, 'Tipo obrigatório'),
  pais: z.string().optional()
});

// SCHEMA DE MEDICAMENTO
export const MedicamentoSchema = z.object({
  id: z.string().optional(),
  nomeComercial: z.string().min(3, 'Nome comercial obrigatório'),
  principioAtivo: z.string().min(1, 'Princípio ativo obrigatório'),
  apresentacao: z.string().min(1, 'Apresentação obrigatória'),
  fabricante: z.string().min(1, 'Fabricante obrigatório')
});

// SCHEMA DE ITEM DE MEDICAMENTO (POSOLOGIA)
export const ItemMedicamentoSchema = z.object({
  nomeMedicamento: z.string().min(1, 'Nome do medicamento obrigatório'),
  principio: z.string().optional(),
  dose: z.string().min(1, 'Dose obrigatória'),
  horarios: z.array(z.string()).min(1, 'Pelo menos um horário necessário'),
  intervalo: z.number().int().positive('Intervalo deve ser positivo'),
  indicacao: z.string().min(1, 'Indicação obrigatória'),
  medicamentold: z.string().optional(),
  horaInicio: z.string().optional()
});

// SCHEMA DE RECEITA
export const ReceitaSchema = z.object({
  id: z.string().optional(),
  nomePaciente: z.string().min(3, 'Nome do paciente obrigatório'),
  prontuario: z.string().min(1, 'Prontuário obrigatório'),
  pacienteId: z.string().optional(),
  profissionalId: z.string().optional(),
  medico: z.string().optional(),
  medico_id: z.string().optional(),
  farmaceutico: z.string().optional(),
  farmaceutico_id: z.string().optional(),
  instituicaoId: z.string().optional(),
  nomeInstituicao: z.string().optional(),
  dataEmissao: z.string().optional(),
  data_nasc: z.string().optional(),
  data_consulta: z.string().optional(),
  data_criacao: z.string().optional(),
  data_atualizacao: z.string().optional(),
  criado_em: z.string().optional(),
  setor_id: z.string().optional(),
  itens: z.array(ItemMedicamentoSchema).min(1, 'Pelo menos um medicamento necessário'),
  medicamentos_fixos: z.array(z.object({
    texto_original_da_posologia: z.string(),
    nome: z.string(),
    indicacao: z.string()
  })).optional(),
  medicamentos_sos: z.array(z.object({
    texto_original_da_posologia: z.string(),
    nome: z.string(),
    indicacao: z.string()
  })).optional()
});

// TIPOS INFERIDOS DOS SCHEMAS
export type PacienteInput = z.infer<typeof PacienteSchema>;
export type ProfissionalInput = z.infer<typeof ProfissionalSchema>;
export type InstituicaoInput = z.infer<typeof InstituicaoSchema>;
export type MedicamentoInput = z.infer<typeof MedicamentoSchema>;
export type ItemMedicamentoInput = z.infer<typeof ItemMedicamentoSchema>;
export type ReceitaInput = z.infer<typeof ReceitaSchema>;

// FUNÇÃO DE VALIDAÇÃO GENÉRICA
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message);
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}
