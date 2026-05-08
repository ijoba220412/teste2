/**
 * EXECUTE COM: npx tsx scripts/seed.ts
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  // COPIE SUAS CHAVES DO .env.local AQUI PARA O SCRIPT RODAR LOCALMENTE
  apiKey: "SUA_API_KEY",
  projectId: "SEU_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("🌱 INICIANDO SEED DE DADOS...");

  // 1. INSTITUIÇÃO (INCA)
  const instRef = await addDoc(collection(db, "instituicoes"), {
    nome: "INCA - HCIII",
    descricao: "INCA - HOSPITAL DO CÂNCER III",
    rua: "RUA VISCONDE DE SANTA ISABEL",
    numero: "274",
    bairro: "VILA ISABEL",
    cidade: "RIO DE JANEIRO",
    uf: "RJ",
    cep: "20560-120",
    telefone1: "(21) 3207-3700",
    tipo: "HOSPITAL",
    pais: "BRASIL"
  });
  console.log("✅ INSTITUIÇÃO CADASTRADA");

  // 2. PROFISSIONAIS (ID MANUAL EM UPPERCASE)
  await setDoc(doc(db, "profissionais", "ANA_LIMA"), {
    nome: "ANA BEATRIZ LIMA",
    cargo: "Farmacêutico(a)",
    numeroRegistro: "35598",
    orgao: "CRF",
    uf: "RJ"
  });

  await setDoc(doc(db, "profissionais", "RICARDO_DE_RODRIGUES"), {
    nome: "RICARDO LUCAS DE SOUZA RODRIGUES",
    cargo: "Médico(a)",
    numeroRegistro: "123456",
    orgao: "CRM",
    uf: "RJ"
  });
  console.log("✅ PROFISSIONAIS CADASTRADOS");

  // 3. PACIENTE EXEMPLO
  await addDoc(collection(db, "pacientes"), {
    nome: "MARLI FERREIRA",
    matricula: "5208248",
    dataNascimento: "1960-05-15",
    instituicaoId: instRef.id,
    alergias: "DIPIRONA, PENICILINA"
  });
  console.log("✅ PACIENTE CADASTRADO");

  console.log("🚀 SEED FINALIZADO COM SUCESSO!");
  process.exit(0);
}

seed().catch(console.error);