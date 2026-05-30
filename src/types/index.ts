export interface Patient {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
}

export interface Symptom {
  id: string;
  name: string;
  file: string;
}

export interface Medication {
  id: string;
  nome: string;
  dosagem: string;
  apresentacao: 'comprimido' | 'capsula' | 'gota' | 'liquido' | 'xarope' | 'spray' | 'pomada';
  indicacao?: string;
  symptomIds?: string[];
  imageUrl?: string;
}

export interface MealIcon {
  hour: string;
  icon: string;
  label: string;
}

export interface PrescriptionItem {
  medicationId: string;
  nome: string;
  apresentacao: string;
  dosagem: string;
  doseQuantity: number;
  frequency: number;
  startHour: string;
  calculatedHours: string[];
  mealIcons: MealIcon[];
  indicacao?: string;
  symptoms: Symptom[];
  duracao?: string;
  observacoes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: PrescriptionItem[];
  profissionalId?: string;
  profissionalNome?: string;
  instituicaoId?: string;
  instituicaoNome?: string;
  createdAt: any;
  updatedAt?: any;
  status?: 'ativa' | 'cancelada' | 'concluida';
}

export interface Professional {
  id: string;
  nome: string;
  cargo: string;
  cargoOutro?: string;
  email?: string;
  especialidade?: string;
  numeroRegistro?: string;
  orgao?: string;
  uf?: string;
  local?: string;
  observacoes?: string;
}

export interface Institution {
  id: string;
  nome: string;
  descricao?: string;
  tipo?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    pais?: string;
  };
  telefone1?: string;
  telefone2?: string;
}
