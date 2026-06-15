import { Timestamp } from 'firebase/firestore';

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

export interface IPaciente {
  id?: string;
  prontuario: string;
  nome: string;
  nascimento?: string;
  genero?: Genero;
  etnia?: string;
  temAlergia: boolean;
  alergiasDescricao?: string;
  observacoes?: string;
  instituicaoId?: string;
  historico?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  contato?: string;
  email?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
}

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
}

export interface IInstituicao {
  id?: string;
  nome: string;
  descricao?: string;
  tipo?: TipoInstituicao;
  telefone1?: string;
  telefone2?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface IMedicamentoPadrao {
  id?: string;
  nome: string;
  apresentacao: ApresentacaoMedicamento;
  indicacao?: string;
  criado_em?: Timestamp;
}

export interface ItemPrescrito {
  medicamentoId: string;
  medicamentoNome: string;
  apresentacao: ApresentacaoMedicamento;
  dose: string;
  via: string;
  aprazamento: string;
  indicacaoIcone?: string;
  indicacaoTexto?: string;
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
}
