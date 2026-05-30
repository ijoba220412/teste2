// COLEÇÃO: instituicoes (IDs automáticos do Firebase)
export interface Instituicao {
  id?: string;
  nome: string; // ex: "INCA - HCIII"
  descricao: string; // ex: "INCA - HOSPITAL DO CÂNCER III"
  
  // CAMPOS DE ENDEREÇO PLANOS (como está no Firestore real)
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string; // ex: "RJ"
  cep: string; // ex: "20560-120"
  pais?: string; // ex: "Brasil"
  
  telefone1: string; // ex: "(21) 3207-3700"
  telefone2?: string;
  tipo: string; // ex: "Hospital"
  email?: string;
  website?: string;
}

// COLEÇÃO: profissionais (IDs manuais em UPPERCASE: ANA_LIMA, RICARDO_DE_RODRIGUES)
export interface Profissional {
  id?: string; // ID manual em uppercase
  nome: string; // ex: "ANA BEATRIZ LIMA"
  cargo: string; // ex: "MÉDICO(A)" ou "FARMACÊUTICO(A)"
  cargoOutro?: string;
  numeroRegistro: string; // ex: "35598"
  orgao: string; // ex: "CRF" ou "CRM"
  uf: string; // ex: "RJ"
  email?: string;
  especialidade?: string;
  local?: string;
  observacoes?: string;
}

// COLEÇÃO: receitas (IDs automáticos)
export interface ItemMedicamento {
  nomeMedicamento: string;
  principio?: string;
  dose: string; // ex: "ESOMEPRAZOL 20 MG PARA PROTEGER O ESTÔMAGO"
  horarios: string[]; // ex: ["00:00", "08:00", "16:00"]
  intervalo: number; // ex: 8 (horas)
  indicacao: string; // ex: "PARA PROTEGER O ESTÔMAGO"
  medicamentold?: string;
  horaInicio?: string; // ex: "08:00"
}

export interface MedicamentoPosologia {
  texto_original_da_posologia: string;
  nome: string;
  indicacao: string;
}

export interface Receita {
  id?: string;
  nomePaciente: string; // ex: "MARLI FERREIRA"
  prontuario: string; // ex: "5208248"
  pacienteId?: string;
  profissionalId?: string;
  medico?: string;
  medico_id?: string;
  farmaceutico?: string;
  farmaceutico_id?: string;
  instituicaoId?: string;
  nomeInstituicao?: string;
  dataEmissao?: string; // ex: "2026-04-30"
  data_nasc?: string;
  data_consulta?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  criado_em?: string;
  setor_id?: string;
  itens: ItemMedicamento[]; // array complexo
  medicamentos_fixos: MedicamentoPosologia[]; // uso contínuo
  medicamentos_sos: MedicamentoPosologia[]; // SOS
}

// COLEÇÃO: pacientes
export interface Paciente {
  id?: string;
  nome: string;
  dataNascimento: string;
  matricula: string; // prontuário
  alergias?: string;
  telefone?: string;
  endereco?: string;
  historico?: string;
  instituicaoId?: string;
  profissionalId?: string;
}

// COLEÇÃO: medicamentos_padrao
export interface Medicamento {
  id?: string;
  nomeComercial: string;
  principioAtivo: string;
  apresentacao: string;
  fabricante: string;
}

// UTILITÁRIOS
export type AcaoTomada = 'tomado' | 'nao_tomado' | 'pulado';

export interface Tomada {
  id?: string;
  prescricaoId: string;
  horario: string;
  status: AcaoTomada;
  registradoEm: string;
}
