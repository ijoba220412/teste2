'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IPaciente } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';
import Link from 'next/link';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function PatientList() {
  const [patients, setPatients] = useState<IPaciente[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<IPaciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pacientes'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as IPaciente));
      // Ordena por nome para facilitar busca
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term) {
      setFilteredPatients(patients);
      return;
    }
    // Busca global: nome, prontuário ou contato
    const filtered = patients.filter(p => 
      p.nome.includes(term) || 
      p.prontuario.includes(term) ||
      (p.contato && p.contato.includes(term))
    );
    setFilteredPatients(filtered);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`TEM CERTEZA QUE DESEJA EXCLUIR O PACIENTE ${nome}?`)) {
      try {
        await deleteDoc(doc(db, 'pacientes', id));
        fetchPatients();
      } catch (error) {
        alert("ERRO AO EXCLUIR PACIENTE");
      }
    }
  };

  if (loading) return <div className="p-8 text-center">CARREGANDO DADOS...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Gerenciar Pacientes</h1>
        <div className="flex gap-4 w-full md:w-auto">
          {/* Barra de busca global - filtro instantâneo */}
          <SearchBar onSearch={handleSearch} placeholder="FILTRAR PACIENTES..." />
          <Link 
            href="/pacientes/novo" 
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold uppercase shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredPatients.length === 0 ? (
            <li className="p-8 text-center text-gray-500 uppercase">Nenhum paciente encontrado.</li>
          ) : (
            filteredPatients.map((patient) => (
              <li 
                key={patient.id} 
                className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900 uppercase">{patient.nome}</p>
                  <p className="text-sm text-gray-500 uppercase">
                    Prontuário: {patient.prontuario} • Nasc: {patient.nascimento}
                  </p>
                </div>
                {/* Ações CRUD: Editar e Excluir */}
                <div className="flex gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/pacientes/${patient.id}/edit`} 
                    className="text-indigo-600 hover:text-indigo-900 p-2 bg-indigo-50 rounded-full"
                    title="Editar"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(patient.id!, patient.nome)} 
                    className="text-red-600 hover:text-red-900 p-2 bg-red-50 rounded-full"
                    title="Excluir"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
