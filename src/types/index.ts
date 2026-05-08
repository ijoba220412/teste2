/**
 * ESTRUTURA REAL DO FIREBASE - SISTEMA DE GESTÃO MÉDICA
 */

export interface Instituicao {
  id?: string;
  nome: string; 
  descricao: string; 
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone1: string;
  telefone2?: string;
  tipo: string;
  pais?: string;
}

export interface Profissional {
  id?: string; // ID MANUAL EM UPPERCASE (EX: ANA_LIMA)
  nome: string;
  cargo: "Médico(a)" | "Farmacêutico(a)" | "Outro";
  cargoOutro?: string;
  numeroRegistro: string;
  orgao: "CRM" | "CRF" | "COREM" | "OUTRO";
  uf: string;
  email?: string;
  especialidade?: string;
  local?: string;
  observacoes?: string;
}

export interface ItemMedicamento {
  nomeMedicamento: string;
  principio?: string;
  dose: string;
  horarios: string[];
  intervalo: number; // EM HORAS
  indicacao: string;
  medicamentold?: string;
  horaInicio?: string;
}

export interface MedicamentoPosologia {
  texto_original_da_posologia: string;
  nome: string;
  indicacao: string;
}

export interface Receita {
  id?: string;
  nomePaciente: string;
  prontuario: string;
  pacienteId?: string;
  profissionalId?: string;
  medico?: string;
  medico_id?: string;
  farmaceutico?: string;
  farmaceutico_id?: string;
  instituicaoId?: string;
  nomeInstituicao?: string;
  dataEmissao?: string; // YYYY-MM-DD para o banco
  data_nasc?: string;
  data_consulta?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  criado_em?: string;
  setor_id?: string;
  itens: ItemMedicamento[];
  medicamentos_fixos: MedicamentoPosologia[];
  medicamentos_sos: MedicamentoPosologia[];
}

export interface Paciente {
  id?: string;
  nome: string;
  dataNascimento: string;
  matricula: string;
  alergias?: string;
  telefone?: string;
  endereco?: string;
  historico?: string;
  instituicaoId?: string;
  profissionalId?: string;
}

export interface Medicamento {
  id?: string;
  nomeComercial: string;
  principioAtivo: string;
  apresentacao: string;
  fabricante: string;
}

export type AcaoTomada = 'tomado' | 'nao_tomado' | 'pulado';

export interface Tomada {
  id?: string;
  prescricaoId: string;
  horario: string;
  status: AcaoTomada;
  registradoEm: string;
}