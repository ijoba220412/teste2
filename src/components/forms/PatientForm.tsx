'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IPaciente, Genero } from '@/lib/types';
import { maskPhone, maskDate, maskCEP, toUpperCase } from '@/lib/utils';
import CepAutoComplete from './CepAutoComplete';

interface PatientFormProps {
  patientId?: string;
}

export default function PatientForm({ patientId }: PatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!patientId);
  
  // Estado do formulário
  const [formData, setFormData] = useState<IPaciente>({
    prontuario: '',
    nome: '',
    nascimento: '',
    genero: Genero.MASCULINO,
    etnia: '',
    temAlergia: false,
    alergiasDescricao: '',
    observacoes: '',
    instituicaoId: '',
    historico: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    contato: '',
    email: '',
    nome_responsavel: '',
    telefone_responsavel: '',
  });

  // Carregar dados se estiver editando
  useEffect(() => {
    if (patientId) {
      loadPatient(patientId);
    }
  }, [patientId]);

  const loadPatient = async (id: string) => {
    try {
      const docRef = doc(db, 'pacientes', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as IPaciente;
        setFormData({
          ...data,
          id: docSnap.id,
        });
        setIsEditing(true);
      } else {
        alert('PACIENTE NÃO ENCONTRADO');
        router.push('/pacientes');
      }
    } catch (error) {
      console.error('Erro ao carregar paciente:', error);
      alert('ERRO AO CARREGAR DADOS DO PACIENTE');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let finalValue = value;
    
    // Aplica máscaras específicas
    if (name === 'cpf' || name === 'contato' || name === 'telefone_responsavel') {
      finalValue = maskPhone(value);
    } else if (name === 'nascimento') {
      finalValue = maskDate(value);
    } else if (name === 'cep') {
      finalValue = maskCEP(value);
    } else if (type === 'text' || type === 'textarea') {
      // Converte para UPPERCASE todos os campos de texto
      finalValue = toUpperCase(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddressFound = (address: { rua: string; bairro: string; cidade: string; uf: string }) => {
    setFormData(prev => ({
      ...prev,
      ...address,
    }));
  };

  const handleCepChange = (cep: string) => {
    setFormData(prev => ({
      ...prev,
      cep,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações básicas
    if (!formData.nome || !formData.prontuario) {
      alert('NOME E PRONTUÁRIO SÃO OBRIGATÓRIOS');
      setLoading(false);
      return;
    }

    try {
      const patientData = {
        ...formData,
        // Garante que tudo está em uppercase antes de salvar
        nome: toUpperCase(formData.nome),
        prontuario: toUpperCase(formData.prontuario),
        rua: toUpperCase(formData.rua || ''),
        bairro: toUpperCase(formData.bairro || ''),
        cidade: toUpperCase(formData.cidade || ''),
        uf: toUpperCase(formData.uf || ''),
        etnia: toUpperCase(formData.etnia || ''),
        observacoes: toUpperCase(formData.observacoes || ''),
        historico: toUpperCase(formData.historico || ''),
        alergiasDescricao: toUpperCase(formData.alergiasDescricao || ''),
        nome_responsavel: toUpperCase(formData.nome_responsavel || ''),
      };

      if (isEditing && patientId) {
        // Atualizar documento existente
        await updateDoc(doc(db, 'pacientes', patientId), patientData);
        alert('PACIENTE ATUALIZADO COM SUCESSO!');
      } else {
        // Criar novo documento usando o prontuário como ID
        await setDoc(doc(db, 'pacientes', formData.prontuario), patientData);
        alert('PACIENTE CADASTRADO COM SUCESSO!');
      }

      router.push('/pacientes');
      router.refresh();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('ERRO AO SALVAR PACIENTE. VERIFIQUE SE O PRONTUÁRIO JÁ EXISTE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 uppercase">
          {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
        </h2>
      </div>

      {/* Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Prontuário *
          </label>
          <input
            type="text"
            name="prontuario"
            value={formData.prontuario}
            onChange={handleInputChange}
            required
            disabled={isEditing}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Data de Nascimento
          </label>
          <input
            type="text"
            name="nascimento"
            value={formData.nascimento}
            onChange={handleInputChange}
            placeholder="DD/MM/AAAA"
            maxLength={10}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Gênero
          </label>
          <select
            name="genero"
            value={formData.genero}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          >
            <option value={Genero.MASCULINO}>MASCULINO</option>
            <option value={Genero.FEMININO}>FEMININO</option>
            <option value={Genero.OUTRO}>OUTRO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Etnia
          </label>
          <input
            type="text"
            name="etnia"
            value={formData.etnia}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Contato (Telefone)
          </label>
          <input
            type="text"
            name="contato"
            value={formData.contato}
            onChange={handleInputChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <CepAutoComplete
              cepValue={formData.cep || ''}
              onCepChange={handleCepChange}
              onAddressFound={handleAddressFound}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Rua
            </label>
            <input
              type="text"
              name="rua"
              value={formData.rua}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Número
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Bairro
            </label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
                Cidade
              </label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
                UF
              </label>
              <input
                type="text"
                name="uf"
                value={formData.uf}
                onChange={handleInputChange}
                maxLength={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alergias e Observações */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">Informações Clínicas</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="temAlergia"
            checked={formData.temAlergia}
            onChange={handleBooleanChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label className="text-sm font-bold text-gray-700 uppercase">
            Possui Alergia?
          </label>
        </div>

        {formData.temAlergia && (
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Descrição das Alergias
            </label>
            <textarea
              name="alergiasDescricao"
              value={formData.alergiasDescricao}
              onChange={handleInputChange}
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Histórico Médico
          </label>
          <textarea
            name="historico"
            value={formData.historico}
            onChange={handleInputChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
            Observações Gerais
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={2}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
          />
        </div>
      </div>

      {/* Responsável */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">Responsável (se aplicável)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Nome do Responsável
            </label>
            <input
              type="text"
              name="nome_responsavel"
              value={formData.nome_responsavel}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Telefone do Responsável
            </label>
            <input
              type="text"
              name="telefone_responsavel"
              value={formData.telefone_responsavel}
              onChange={handleInputChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 pt-6 border-t mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 uppercase"
        >
          {loading ? 'SALVANDO...' : 'SALVAR PACIENTE'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/pacientes')}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-md hover:bg-gray-50 transition-colors uppercase"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
}
