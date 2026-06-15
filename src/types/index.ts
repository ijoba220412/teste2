import { Timestamp } from 'firebase/firestore';

// ============================================================================
// ENUMS E CONSTANTES
// ============================================================================

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO'
}

export enum ApresentacaoMedicamento {
  CAPSULA = 'CÁPSULA',
  COMPRIMIDO = 'COMPRIMIDO',
  GOTAS = 'GOTAS',
  LIQUIDO = 'LÍQUIDO',
  INJETAVEL = 'INJETÁVEL',
  POMADA = 'POMADA'
}

export enum CargoProfissional {
  MEDICO = 'MÉDICO(A)',
  ENFERMEIRO = 'ENFERMEIRO(A)',
  FARMACEUTICO = 'FARMACÊUTICO(A)',
  OUTRO = 'OUTRO'
}

export enum TipoInstituicao {
  HOSPITAL = 'HOSPITAL',
  CLINICA = 'CLÍNICA',
  UBS = 'UBS',
  UPA = 'UPA',
  OUTRO = 'OUTRO'
}

// ============================================================================
// PACIENTES
// ============================================================================

export interface IPaciente {
  id?: string;
  nome: string;
  prontuario: string;
  nascimento?: string;
  genero?: Genero;
  etnia?: string;
  temAlergia: boolean;
  alergiasDescricao?: string;
  observacoes?: string;
  instituicaoId?: string;
  historico?: string;
  // Endereço
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  // Contato
  contato?: string;
  email?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  [key: string]: any;
}

// ============================================================================
// PROFISSIONAIS
// ============================================================================

export interface IProfissional {
  id?: string;
  nome: string;
  cargo: CargoProfissional;
  cargoOutro?: string;
  especialidade?: string;
  local?: string;
  observacoes?: string;
  email?: string;
  orgao?: string;
  numeroRegistro?: string;
  uf?: string;
  [key: string]: any;
}

// ============================================================================
// INSTITUIÇÕES
// ============================================================================

export interface IInstituicao {
  id?: string;
  nome: string;
  descricao?: string;
  tipo: TipoInstituicao | string;
  telefone1?: string;
  telefone2?: string;
  // Endereço completo
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  pais?: string;
  email?: string;
  website?: string;
  [key: string]: any;
}

// ============================================================================
// MEDICAMENTOS PADRÃO
// ============================================================================

export interface IMedicamentoPadrao {
  id?: string;
  nome: string;
  apresentacao: ApresentacaoMedicamento | string;
  indicacao?: string;
  criado_em?: Timestamp;
  [key: string]: any;
}

// ============================================================================
// RECEITAS E PRESCRIÇÕES
// ============================================================================

export interface ItemPrescrito {
  medicamentoId: string;
  medicamentoNome: string;
  apresentacao: ApresentacaoMedicamento | string;
  dose: string;
  via: string;
  aprazamento: string; // ex: "8h/8h", "06:00, 14:00, 22:00", "SOS"
  indicacaoIcone?: string;
  indicacaoTexto?: string;
  [key: string]: any;
}

export interface IReceita {
  id?: string;
  pacienteId: string;
  pacienteNome: string;
  prontuario: string;
  profissionalId: string;
  profissionalNome: string;
  instituicaoId?: string;
  instituicaoNome?: string;
  dataCriacao: Timestamp;
  dataUltimaEdicao: Timestamp;
  itensPrescritos: ItemPrescrito[];
  orientacoesGerais?: string;
  [key: string]: any;
}

// ============================================================================
// ALIASES PARA COMPATIBILIDADE
// ============================================================================

export type Paciente = IPaciente;
export type Profissional = IProfissional;
export type Instituicao = IInstituicao;
export type MedicamentoPadrao = IMedicamentoPadrao;
export type Receita = IReceita;
export type Medicamento = IMedicamentoPadrao;
