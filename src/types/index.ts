// ============================================================================
// INTERFACES PARA FIRESTORE REAL (baseado nas suas imagens)
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
  dataEmissao?: string;
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

// ============================================================================
// INTERFACE PARA COMPONENTES EXISTENTES (dashboard + receita/[id])
// ESTA É A QUE SEUS COMPONENTES REALMENTE USAM
// ============================================================================

export interface MedicationItem {
  nome: string;
  dosagem: string;
  doseQuantity: number;
  apresentacao: 'comprimido' | 'capsula' | 'mL' | 'liquido';
  mealIcons?: Array<{
    icon: string;
    label: string;
    hour: string;
  }>;
  symptoms?: Array<{
    name: string;
    file: string;
  }>;
  instrucoes?: string;
  horarioInicio?: string;
  frequencia?: string;
}

export interface Prescription {
  id?: string;
  patientName: string;
  patientRegistration?: string;
  patientBirthDate?: string;
  patientAllergies?: string;
  
  // Profissional
  doctorName?: string;
  doctorCrm?: string;
  pharmacistName?: string;
  pharmacistCrf?: string;
  
  // Instituição
  institutionName?: string;
  institutionAddress?: string;
  institutionPhone?: string;
  
  // Medicamentos (estrutura que seus componentes usam)
  medications: MedicationItem[];
  
  // Datas (Firestore Timestamp ou string)
  createdAt?: any; // Firestore Timestamp ou string
  updatedAt?: any;
  prescriptionDate?: string;
  
  // Metadados
  tipo?: 'continuo' | 'sos' | 'ambos';
  observacoes?: string;
  status?: 'ativa' | 'cancelada' | 'concluida';
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
}

// ============================================================================
// ALIASES PARA COMPATIBILIDADE (evita erros de import)
// ============================================================================

export type Institution = Instituicao;
export type HealthcareProfessional = Profissional;
export type Patient = Paciente;
export type Medicine = Medicamento;
export type PrescriptionItem = ItemMedicamento;
export type Posology = MedicamentoPosologia;
export type IntakeAction = AcaoTomada;
export type ScheduledIntake = Tomada;
