import React, { useState, useEffect } from 'react';
import { X, Sparkles, Server, CheckSquare, Square, ChevronRight } from 'lucide-react';
import { generatePointsForEquipment } from '../services/geminiService';
import { Equipment } from '../types';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (equipment: Equipment) => void;
}

// --- Configuration Data ---

interface EquipmentTemplate {
  id: string;
  label: string;
  defaultCategory: string;
  options: string[];
}

interface CategoryDef {
  id: string;
  label: string;
  equipment: EquipmentTemplate[];
}

const PREDEFINED_CONFIG: CategoryDef[] = [
  {
    id: 'HVAC',
    label: 'AVAC (HVAC)',
    equipment: [
      {
        id: 'ahu',
        label: 'Unidade de Tratamento de Ar (UTA)',
        defaultCategory: 'HVAC',
        options: [
          'Recuperação de Calor (Roda)',
          'Recuperação de Calor (Baterias)',
          'Bateria de Aquecimento (Água)',
          'Bateria de Aquecimento (Elétrica)',
          'Bateria de Arrefecimento',
          'Humidificação',
          'Ventiladores com VEX (Velocidade Variável)',
          'Monitorização de Filtros (Pressostatos)',
          'Sondas de Qualidade de Ar (CO2)',
          'Registos de Corte (Comportas)'
        ]
      },
      {
        id: 'fcu',
        label: 'Ventiloconvector (FCU)',
        defaultCategory: 'HVAC',
        options: [
          'Sistema 2 Tubos',
          'Sistema 4 Tubos',
          'Válvula Modulante (0-10V)',
          'Válvula On/Off',
          'Velocidade do Ventilador (3 Estágios)',
          'Velocidade do Ventilador (EC/0-10V)',
          'Sonda de Condensados'
        ]
      },
      {
        id: 'chiller',
        label: 'Chiller / Bomba de Calor',
        defaultCategory: 'HVAC',
        options: [
          'Bombas Primárias Incorporadas',
          'Monitorização de Energia Elétrica',
          'Interface de Comunicação (Modbus/BACnet)',
          'Controlo de Setpoint Remoto',
          'Estado de Compressores'
        ]
      },
      {
        id: 'boiler',
        label: 'Caldeira',
        defaultCategory: 'HVAC',
        options: [
          'Queimador Modulante',
          'Bombas de Circulação',
          'Válvula de Corte de Gás',
          'Deteção de Gás',
          'Monitorização de Temperatura de Fumos'
        ]
      },
      {
        id: 'extraction',
        label: 'Ventilação / Extração',
        defaultCategory: 'HVAC',
        options: [
          'Ventilador de Extração WC',
          'Ventilador de Desenfumagem (Segurança)',
          'VEX (Variador de Frequência)',
          'Monitorização de Pressão',
          'Interligação com CDI (Incêndio)'
        ]
      }
    ]
  },
  {
    id: 'Electrical',
    label: 'Eletricidade',
    equipment: [
      {
        id: 'qe',
        label: 'Quadro Elétrico (QE)',
        defaultCategory: 'Electrical',
        options: [
          'Disjuntor Geral (Estado/Trip)',
          'Analisador de Rede (Modbus)',
          'Monitorização de Circuitos Específicos',
          'Sinalização de Sobretensões'
        ]
      },
      {
        id: 'ups',
        label: 'UPS',
        defaultCategory: 'Electrical',
        options: [
          'Estado das Baterias',
          'Modo Bypass',
          'Interface de Comunicação SNMP/Modbus',
          'Alarme Geral'
        ]
      },
      {
        id: 'generator',
        label: 'Grupo Gerador',
        defaultCategory: 'Electrical',
        options: [
          'Nível de Combustível',
          'Temperatura do Motor',
          'Tensão de Bateria de Arranque',
          'Controlo de ATS (Rede/Gerador)',
          'Interface Modbus'
        ]
      }
    ]
  },
  {
    id: 'Plumbing',
    label: 'Hidráulica',
    equipment: [
      {
        id: 'pumps',
        label: 'Grupo de Bombagem (Águas)',
        defaultCategory: 'Plumbing',
        options: [
          'Bombas de Velocidade Variável',
          'Alternância de Bombas',
          'Pressostato de Falta de Água',
          'Transdutor de Pressão (4-20mA)'
        ]
      },
      {
        id: 'dhw',
        label: 'Produção AQS',
        defaultCategory: 'Plumbing',
        options: [
          'Depósito de Acumulação',
          'Bomba de Circulação AQS',
          'Resistência Elétrica de Apoio',
          'Controlo de Legionella'
        ]
      }
    ]
  }
];

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0);
  const [selectedEquipmentIdx, setSelectedEquipmentIdx] = useState<number>(0);
  const [tag, setTag] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset selection when category changes
  useEffect(() => {
    setSelectedEquipmentIdx(0);
    setSelectedOptions(new Set());
  }, [selectedCategoryIdx]);

  // Reset options when equipment type changes
  useEffect(() => {
    setSelectedOptions(new Set());
  }, [selectedEquipmentIdx]);

  if (!isOpen) return null;

  const currentCategory = PREDEFINED_CONFIG[selectedCategoryIdx];
  const currentEquipment = currentCategory.equipment[selectedEquipmentIdx];

  const toggleOption = (option: string) => {
    const newOptions = new Set(selectedOptions);
    if (newOptions.has(option)) {
      newOptions.delete(option);
    } else {
      newOptions.add(option);
    }
    setSelectedOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const fullName = `${currentEquipment.label} ${tag ? `- ${tag}` : ''}`;
      const optionsList = Array.from(selectedOptions).join(', ');
      const technicalContext = `Equipamento Base: ${currentEquipment.label}. \nParâmetros/Componentes Selecionados: ${optionsList || 'Nenhum extra selecionado'}. \nCategoria: ${currentCategory.label}.`;

      // Generate initial points using AI with the structured context
      const points = await generatePointsForEquipment(fullName, technicalContext);
      
      const newEquipment: Equipment = {
        id: crypto.randomUUID(),
        name: fullName,
        category: currentCategory.id,
        description: optionsList,
        points
      };

      onAdd(newEquipment);
      resetForm();
    } catch (error) {
      console.error("Failed to create equipment", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTag('');
    setSelectedCategoryIdx(0);
    setSelectedEquipmentIdx(0);
    setSelectedOptions(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={!isGenerating ? resetForm : undefined}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <Server className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Configurar Novo Equipamento
                  </h3>
                  <p className="text-sm text-gray-500">
                    Selecione o tipo e os componentes para gerar a lista de pontos.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Step 1: Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      1. Categoria
                    </label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                      value={selectedCategoryIdx}
                      onChange={(e) => setSelectedCategoryIdx(Number(e.target.value))}
                      disabled={isGenerating}
                    >
                      {PREDEFINED_CONFIG.map((cat, idx) => (
                        <option key={cat.id} value={idx}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      2. Equipamento
                    </label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                      value={selectedEquipmentIdx}
                      onChange={(e) => setSelectedEquipmentIdx(Number(e.target.value))}
                      disabled={isGenerating}
                    >
                      {currentCategory.equipment.map((eq, idx) => (
                        <option key={eq.id} value={idx}>{eq.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 2: Identification */}
                <div>
                  <label htmlFor="tag" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    3. Identificação (Tag / Localização)
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      {currentEquipment.label}
                    </span>
                    <input
                      type="text"
                      id="tag"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 border"
                      placeholder="Ex: 01 - Piso 2, Sala Reuniões"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Step 3: Parameters */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    4. Parâmetros Técnicos e Componentes
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentEquipment.options.map((option) => {
                        const isSelected = selectedOptions.has(option);
                        return (
                          <div
                            key={option}
                            onClick={() => !isGenerating && toggleOption(option)}
                            className={`flex items-center p-2 rounded cursor-pointer transition-colors border ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className={`flex-shrink-0 mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                              {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {currentEquipment.options.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">
                        Sem parâmetros opcionais definidos para este equipamento.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all items-center"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    A Gerar Lista...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Pontos
                  </>
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={resetForm}
                disabled={isGenerating}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEquipmentModal;