import { Timestamp } from 'firebase/firestore';

// ============================================================================
// INTERFACES REAIS DO FIRESTORE (Baseadas nas suas imagens)
// ============================================================================

export interface Instituicao {
  id?: string;
  nome: string;
  descricao: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  pais?: string;
  telefone1: string;
  telefone2?: string;
  tipo: string;
  email?: string;
  website?: string;
  [key: string]: any; // Blindagem contra campos extras do Labs
}

export interface Profissional {
  id?: string;
  nome: string;
  cargo: string;
  cargoOutro?: string;
  numeroRegistro: string;
  orgao: string;
  uf: string;
  email?: string;
  especialidade?: string;
  local?: string;
  observacoes?: string;
  [key: string]: any;
}

export interface ItemMedicamento {
  nomeMedicamento: string;
  principio?: string;
  dose: string;
  horarios: string[];
  intervalo: number;
  indicacao: string;
  medicamentold?: string;
  horaInicio?: string;
  [key: string]: any;
}

export interface MedicamentoPosologia {
  texto_original_da_posologia: string;
  nome: string;
  indicacao: string;
  [key: string]: any;
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
  dataEmissao?: string;
  data_nasc?: string;
  data_consulta?: string;
  data_criacao?: string | Timestamp;
  data_atualizacao?: string | Timestamp;
  criado_em?: string | Timestamp;
  setor_id?: string;
  itens: ItemMedicamento[];
  medicamentos_fixos: MedicamentoPosologia[];
  medicamentos_sos: MedicamentoPosologia[];
  [key: string]: any;
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
  [key: string]: any;
}

// ============================================================================
// MEDICAMENTO (Expandida para aceitar os campos do Google Labs)
// ============================================================================
export interface Medicamento {
  id?: string;
  
  // Campos do seu banco de dados original
  nomeComercial?: string;
  principioAtivo?: string;
  apresentacao?: string;
  fabricante?: string;
  
  // Campos que o Google Labs inventou para o formulário
  nome?: string;
  dosagem?: string;
  indicacao?: string;
  
  // Arrays de suporte visual (usados na tela de impressão)
  symptoms?: Array<{ name: string; file: string }>;
  mealIcons?: Array<{ icon: string; label: string; hour: string }>;
  
  // 🛡️ BLINDAGEM: Permite qualquer outra propriedade.
  // Isso evita que o build quebre se o Labs adicionar campos inesperados.
  [key: string]: any; 
}

// ============================================================================
// INTERFACE DO DASHBOARD (Prescription)
// ============================================================================

export interface MedicationItem {
  nome: string;
  dosagem: string;
  doseQuantity: number;
  apresentacao: 'comprimido' | 'capsula' | 'mL' | 'liquido' | string;
  mealIcons?: Array<{ icon: string; label: string; hour: string }>;
  symptoms?: Array<{ name: string; file: string }>;
  instrucoes?: string;
  horarioInicio?: string;
  frequencia?: string;
  tipo?: string;
  [key: string]: any;
}

export interface Prescription {
  id?: string;
  patientName: string;
  patientRegistration?: string;
  patientBirthDate?: string;
  patientAllergies?: string;
  doctorName?: string;
  doctorCrm?: string;
  pharmacistName?: string;
  pharmacistCrf?: string;
  institutionName?: string;
  institutionAddress?: string;
  institutionPhone?: string;
  medications: MedicationItem[];
  createdAt?: any; 
  updatedAt?: any;
  prescriptionDate?: string;
  tipo?: 'continuo' | 'sos' | 'ambos' | string;
  observacoes?: string;
  status?: 'ativa' | 'cancelada' | 'concluida' | string;
  [key: string]: any;
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

export type AcaoTomada = 'tomado' | 'nao_tomado' | 'pulado';

export interface Tomada {
  id?: string;
  prescricaoId: string;
  horario: string;
  status: AcaoTomada;
  registradoEm: string;
  [key: string]: any;
}

// ============================================================================
// 🛡️ BLINDAGEM DE ALIASES (INGLÊS -> PORTUGUÊS)
// ============================================================================

export type Medication = Medicamento;
export type Medicine = Medicamento;
export type Institution = Instituicao;
export type Professional = Profissional;
export type HealthcareProfessional = Profissional;
export type Patient = Paciente;
export type PrescriptionItem = ItemMedicamento;
export type Posology = MedicamentoPosologia;
export type IntakeAction = AcaoTomada;
export type ScheduledIntake = Tomada;
