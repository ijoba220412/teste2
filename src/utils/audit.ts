import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// INTERFACE DO LOG DE AUDITORIA
export interface AuditLog {
  id?: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  colecao: string;
  documentoId: string;
  dadosAntigos?: Record<string, any>;
  dadosNovos?: Record<string, any>;
  usuario?: string;
  dataHora: string;
  ip?: string;
  userAgent?: string;
}

// FUNÇÃO PARA REGISTRAR LOG DE AUDITORIA
export async function logAuditAction(log: Omit<AuditLog, 'id' | 'dataHora'>) {
  try {
    const auditLog: Omit<AuditLog, 'id'> = {
      ...log,
      dataHora: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    await addDoc(collection(db, 'audit_logs'), auditLog);
    console.log('✅ Log de auditoria registrado:', auditLog.acao, auditLog.colecao);
  } catch (error) {
    console.error('❌ Erro ao registrar log de auditoria:', error);
    // Não lançamos o erro para não interromper o fluxo principal
  }
}

// HOOK PARA OPERAÇÕES COM AUDITORIA
export function useAuditLog() {
  const logAction = async (log: Omit<AuditLog, 'id' | 'dataHora'>) => {
    return await logAuditAction(log);
  };

  return { logAction };
}

// FUNÇÃO PARA OBTER DADOS SENSÍVEIS (COM LOG)
export async function viewWithAudit<T>(
  collectionName: string,
  documentId: string,
  data: T,
  usuario?: string
) {
  await logAuditAction({
    acao: 'VIEW',
    colecao: collectionName,
    documentoId: documentId,
    dadosNovos: data as Record<string, any>,
    usuario
  });

  return data;
}

// FUNÇÃO PARA CRIAR COM AUDITORIA
export async function createWithAudit<T>(
  collectionName: string,
  data: T,
  usuario?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    criado_em: serverTimestamp(),
    atualizado_em: serverTimestamp()
  });

  await logAuditAction({
    acao: 'CREATE',
    colecao: collectionName,
    documentoId: docRef.id,
    dadosNovos: data as Record<string, any>,
    usuario
  });

  return docRef.id;
}

// FUNÇÃO PARA ATUALIZAR COM AUDITORIA
export async function updateWithAudit<T>(
  collectionName: string,
  documentId: string,
  oldData: T,
  newData: Partial<T>,
  usuario?: string
) {
  // Nota: implementação real exigiria updateDoc do Firebase
  // Esta é uma estrutura para você implementar conforme necessário
  
  await logAuditAction({
    acao: 'UPDATE',
    colecao: collectionName,
    documentoId: documentId,
    dadosAntigos: oldData as Record<string, any>,
    dadosNovos: newData as Record<string, any>,
    usuario
  });
}

// FUNÇÃO PARA DELETAR COM AUDITORIA
export async function deleteWithAudit(
  collectionName: string,
  documentId: string,
  oldData: Record<string, any>,
  usuario?: string
) {
  // Nota: implementação real exigiria deleteDoc do Firebase
  // Esta é uma estrutura para você implementar conforme necessário
  
  await logAuditAction({
    acao: 'DELETE',
    colecao: collectionName,
    documentoId: documentId,
    dadosAntigos: oldData,
    usuario
  });
}

// LGPD - FUNÇÕES PARA GERENCIAMENTO DE DADOS PESSOAIS
export interface LGPDConsent {
  pacienteId: string;
  consentimentoLGPD: boolean;
  dataConsentimento: string;
  finalidades: string[];
  podeCompartilhar: boolean;
  podePesquisa: boolean;
}

export async function registerLGPDConsent(consent: LGPDConsent) {
  try {
    await addDoc(collection(db, 'lgpd_consentimentos'), {
      ...consent,
      dataRegistro: new Date().toISOString()
    });
    
    await logAuditAction({
      acao: 'CREATE',
      colecao: 'lgpd_consentimentos',
      documentoId: consent.pacienteId,
      dadosNovos: consent as Record<string, any>
    });
    
    console.log('✅ Consentimento LGPD registrado');
  } catch (error) {
    console.error('❌ Erro ao registrar consentimento LGPD:', error);
  }
}

export async function requestDataExport(pacienteId: string, email: string) {
  try {
    await addDoc(collection(db, 'lgpd_export_requests'), {
      pacienteId,
      email,
      dataSolicitacao: new Date().toISOString(),
      status: 'PENDENTE'
    });
    
    await logAuditAction({
      acao: 'CREATE',
      colecao: 'lgpd_export_requests',
      documentoId: pacienteId,
      dadosNovos: { pacienteId, email }
    });
    
    console.log('✅ Solicitação de exportação de dados registrada');
  } catch (error) {
    console.error('❌ Erro ao solicitar exportação de dados:', error);
  }
}

export async function requestDataDeletion(pacienteId: string, justificativa: string) {
  try {
    await addDoc(collection(db, 'lgpd_deletion_requests'), {
      pacienteId,
      justificativa,
      dataSolicitacao: new Date().toISOString(),
      status: 'PENDENTE'
    });
    
    await logAuditAction({
      acao: 'CREATE',
      colecao: 'lgpd_deletion_requests',
      documentoId: pacienteId,
      dadosNovos: { pacienteId, justificativa }
    });
    
    console.log('✅ Solicitação de exclusão de dados registrada');
  } catch (error) {
    console.error('❌ Erro ao solicitar exclusão de dados:', error);
  }
}
