'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Medication, Patient, PrescriptionItem, Symptom } from '@/types';
import { SYMPTOMS_DATA } from '@/lib/symptoms';
import { calculateHours, generateMealIcons, MEDICATION_ICONS } from '@/utils/generateHorarios';
import { Plus, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NovaReceita() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const pSnap = await getDocs(collection(db, 'patients'));
      setPatients(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));
      const mSnap = await getDocs(collection(db, 'medications'));
      setMedications(mSnap.docs.map(d => ({ id: d.id, ...d.data() } as Medication)));
    })();
  }, []);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId) 
        : [...prev, symptomId]
    );
  };

  const addMedication = () => {
    if (medications.length === 0) return alert('Cadastre um medicamento primeiro');
    const med = medications[0];
    const startHour = '06:00';
    const frequency = 2;
    const calc = calculateHours(startHour, frequency);
    
    const symptoms = SYMPTOMS_DATA.filter(s => selectedSymptoms.includes(s.id));
    
    setItems([...items, {
      medicationId: med.id,
      nome: med.nome,
      apresentacao: med.apresentacao,
      dosagem: med.dosagem,
      doseQuantity: 1,
      frequency,
      startHour,
      calculatedHours: calc,
      mealIcons: generateMealIcons(calc),
      indicacao: med.indicacao,
      symptoms: symptoms,
    }]);
    
    setSelectedSymptoms([]);
  };

  const updateItem = (idx: number, patch: Partial<PrescriptionItem>) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], ...patch };
    
    if (patch.frequency || patch.startHour) {
      const calc = calculateHours(updated[idx].startHour, updated[idx].frequency);
      updated[idx].calculatedHours = calc;
      updated[idx].mealIcons = generateMealIcons(calc);
    }
    
    if (patch.medicationId) {
      const med = medications.find(m => m.id === patch.medicationId);
      if (med) {
        updated[idx].nome = med.nome;
        updated[idx].apresentacao = med.apresentacao;
        updated[idx].dosagem = med.dosagem;
        updated[idx].indicacao = med.indicacao;
      }
    }
    
    setItems(updated);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const save = async () => {
    if (!patientId) return alert('Selecione um paciente');
    if (items.length === 0) return alert('Adicione ao menos um medicamento');
    
    const patient = patients.find(p => p.id === patientId);
    
    await addDoc(collection(db, 'prescriptions'), {
      patientId,
      patientName: patient?.nome || patientName,
      medications: items,
      createdAt: serverTimestamp(),
      status: 'ativa',
    });
    
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Nova Receita Facilitada</h2>

      <div className="card">
        <label className="font-bold text-slate-700 block mb-2">Paciente</label>
        <select 
          value={patientId} 
          onChange={e => {
            setPatientId(e.target.value);
            const patient = patients.find(p => p.id === e.target.value);
            if (patient) setPatientName(patient.nome);
          }}
          className="input-field"
        >
          <option value="">Selecione...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div className="card">
        <label className="block text-sm font-bold text-slate-700 mb-3">
          Sintomas/Indicações visuais:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {SYMPTOMS_DATA.map(symptom => (
            <button
              key={symptom.id}
              type="button"
              onClick={() => toggleSymptom(symptom.id)}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedSymptoms.includes(symptom.id)
                  ? 'border-primary bg-teal-50 shadow-md'
                  : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              <img 
                src={`/img/n/f/${symptom.file}`} 
                alt={symptom.name}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xs font-semibold text-center">{symptom.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="card">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label className="text-sm font-bold text-slate-600">Medicamento</label>
                <select 
                  value={item.medicationId} 
                  onChange={e => updateItem(idx, { medicationId: e.target.value })}
                  className="input-field"
                >
                  {medications.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.dosagem})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Quantidade por dose</label>
                <input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={item.doseQuantity}
                  onChange={e => updateItem(idx, { doseQuantity: parseInt(e.target.value) || 1 })}
                  className="input-field" 
                />
              </div>
              <div className="flex items-end justify-end">
                <button 
                  onClick={() => removeItem(idx)} 
                  className="text-red-500 p-3 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-slate-600">Frequência (vezes ao dia)</label>
                <select 
                  value={item.frequency} 
                  onChange={e => updateItem(idx, { frequency: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {[1,2,3,4,6,8,12].map(n => (
                    <option key={n} value={n}>
                      {n}x ao dia (a cada {24/n}h)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Horário inicial</label>
                <input 
                  type="time" 
                  value={item.startHour} 
                  onChange={e => updateItem(idx, { startHour: e.target.value })}
                  className="input-field" 
                />
              </div>
            </div>

            {/* PREVIEW VISUAL DA DOSE */}
            <div className="bg-teal-50 rounded-2xl p-5 border-2 border-teal-200">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                Como o paciente vai ver:
              </p>
              
              {/* Doses */}
              <div className="flex flex-wrap items-center gap-2 text-4xl mb-4">
                {Array.from({ length: item.doseQuantity }).map((_, i) => (
                  <img 
                    key={i} 
                    src={MEDICATION_ICONS[item.apresentacao]} 
                    alt={item.apresentacao}
                    className="w-12 h-12 object-contain"
                  />
                ))}
              </div>
              
              {/* Horários */}
              <div className="flex flex-wrap gap-3">
                {item.mealIcons.map((mi, i) => (
                  <div key={i} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
                    <img 
                      src={mi.icon} 
                      alt={mi.label}
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{mi.label}</p>
                      <p className="text-xs text-slate-500">{mi.hour}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Sintomas */}
              {item.symptoms.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase text-slate-600 mb-2">
                    Para que serve:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {item.symptoms.map((symptom, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow border-2 border-teal-200 text-center">
                        <img 
                          src={`/img/n/f/${symptom.file}`} 
                          alt={symptom.name}
                          className="w-16 h-16 object-contain mx-auto mb-1"
                        />
                        <p className="text-xs font-bold text-slate-700">{symptom.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={addMedication} 
          className="btn-secondary"
        >
          <Plus /> Adicionar Medicamento
        </button>
        <button 
          onClick={save} 
          disabled={items.length === 0}
          className="btn-primary disabled:opacity-50"
        >
          <Save /> Salvar Receita
        </button>
      </div>
    </div>
  );
}
