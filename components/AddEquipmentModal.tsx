import React, { useState, useEffect } from 'react';
import { Sparkles, Server, CheckSquare, Square, Layers } from 'lucide-react';
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
          'Recuperação de Calor (Plate)',
          'Bateria de Aquecimento (Água)',
          'Bateria de Aquecimento (Elétrica)',
          'Bateria de Arrefecimento',
          'Humidificação (Vapor/Água)',
          'Ventiladores com VEX (Velocidade Variável)',
          'Monitorização de Filtros (Pressostatos)',
          'Sondas de Qualidade de Ar (CO2/VOC)',
          'Registos de Corte (Comportas Motorizadas)',
          'Bypass de Recuperador'
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
          'Sonda de Condensados',
          'Sonda de Retorno de Ar',
          'Contacto de Janela'
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
          'Estado de Compressores',
          'Válvula de Corte Motorizada',
          'Fluxostato de Segurança',
          'Comutação Verão/Inverno'
        ]
      },
      {
        id: 'cooling_tower',
        label: 'Torre de Arrefecimento',
        defaultCategory: 'HVAC',
        options: [
          'Ventilador com VEX (Variador)',
          'Válvula de Bypass (3 Vias)',
          'Resistência de Tabuleiro (Anti-gelo)',
          'Controlo de Nível da Bacia',
          'Bomba de Spray',
          'Tratamento de Água Integrado'
        ]
      },
      {
        id: 'rooftop',
        label: 'Unidade Rooftop',
        defaultCategory: 'HVAC',
        options: [
          'Free-Cooling',
          'Queimador a Gás Incorporado',
          'Recuperação de Energia',
          'Interface Modbus/BACnet',
          'Sonda de CO2 Ambiente',
          'Deteção de Fumos na Conduta'
        ]
      },
      {
        id: 'vrf',
        label: 'Sistema VRF (Unid. Exterior + Interiores)',
        defaultCategory: 'HVAC',
        options: [
          'Gateway Centralizado (BACnet/Modbus)',
          'Controlo Individual de Setpoint',
          'Bloqueio de Comandos Locais',
          'Medição de Energia por Unidade',
          'Alarmes de Erro Específicos',
          'Unidades de Recuperação de Calor'
        ]
      },
      {
        id: 'split',
        label: 'Split / Multi-Split (Expansão Direta)',
        defaultCategory: 'HVAC',
        options: [
          'Interface Wi-Fi/Modbus',
          'Contacto Seco (Marcha/Paragem)',
          'Feedback de Funcionamento',
          'Alarme de Falha Geral'
        ]
      },
      {
        id: 'vav',
        label: 'Caixa VAV (Volume de Ar Variável)',
        defaultCategory: 'HVAC',
        options: [
          'Bateria de Reaquecimento (Água)',
          'Bateria de Reaquecimento (Elétrica)',
          'Sonda de CO2 para Controlo',
          'Sensor de Presença',
          'Feedback de Posição da Comporta'
        ]
      },
      {
        id: 'precision_ac',
        label: 'Ar Condicionado de Precisão (CRAC)',
        defaultCategory: 'HVAC',
        options: [
          'Controlo de Humidade (Humidificação/Desumidificação)',
          'Detetor de Fugas de Água',
          'Interface SNMP/Modbus',
          'Dupla Fonte de Alimentação (ATS)',
          'Monitorização de Filtros Sujos',
          'Sondas de Temperatura Rack'
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
          'Monitorização de Temperatura de Fumos',
          'Controlo em Cascata'
        ]
      },
      {
        id: 'heat_exchanger',
        label: 'Permutador de Calor (Placas)',
        defaultCategory: 'HVAC',
        options: [
          'Válvula de Controlo no Primário',
          'Sondas de Temperatura (4x - Entradas/Saídas)',
          'Medidor de Energia Térmica',
          'Bombas de Circulação Secundário',
          'Controlo de Pressão Diferencial'
        ]
      },
      {
        id: 'extraction',
        label: 'Ventilação / Extração Geral',
        defaultCategory: 'HVAC',
        options: [
          'Ventilador de Extração WC',
          'VEX (Variador de Frequência)',
          'Monitorização de Pressão',
          'Relógio Horário'
        ]
      },
      {
        id: 'garage_vent',
        label: 'Ventilação de Garagens / Desenfumagem',
        defaultCategory: 'HVAC',
        options: [
          'Ventiladores de Impulsão (Jet Fans)',
          'Ventiladores de Extração (400ºC/2h)',
          'Detetores de CO (Monóxido de Carbono)',
          'Detetores de NO2 (Dióxido de Azoto)',
          'Painel de Bombeiros (Prioridade)',
          'Comportas Corta-Fogo Motorizadas'
        ]
      },
      {
        id: 'air_curtain',
        label: 'Cortina de Ar',
        defaultCategory: 'HVAC',
        options: [
          'Contacto de Porta',
          'Estágios de Aquecimento Elétrico',
          'Válvula de Aquecimento (Água)',
          'Velocidade do Ventilador',
          'Termóstato de Segurança'
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
          'Sinalização de Sobretensões (SPD)',
          'Presença de Tensão nas Fases',
          'Temperatura do Quadro'
        ]
      },
      {
        id: 'lighting',
        label: 'Controlo de Iluminação',
        defaultCategory: 'Electrical',
        options: [
          'Gateway DALI',
          'Gateway KNX',
          'Sensores de Luminosidade/Presença',
          'Controlo Horário',
          'Comando de Zonas (On/Off)',
          'Dimerização (0-10V)',
          'Iluminação de Emergência (Monitorização)'
        ]
      },
      {
        id: 'sun_protection',
        label: 'Proteções Solares (Estores/Persianas)',
        defaultCategory: 'Electrical',
        options: [
          'Motor Sobe/Desce (2 saídas)',
          'Posicionamento % (0-10V)',
          'Controlo de Lamelas (Tilt)',
          'Interface KNX',
          'Interface SMI',
          'Alarme de Vento (Proteção)',
          'Sensor de Luminosidade Fachada',
          'Controlo Local (Botão)'
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
          'Alarme Geral',
          'Tempo de Autonomia Restante',
          'Temperatura Ambiente'
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
          'Interface Modbus',
          'Alarme de Falha de Arranque',
          'Resistência de Pré-Aquecimento'
        ]
      },
      {
        id: 'capacitor_bank',
        label: 'Bateria de Condensadores',
        defaultCategory: 'Electrical',
        options: [
          'Alarme Geral',
          'Fator de Potência Atual',
          'Temperatura Interna',
          'Estágios Ativos',
          'Harmónicas (THD)'
        ]
      },
      {
        id: 'transformer',
        label: 'Transformador',
        defaultCategory: 'Electrical',
        options: [
          'Alarme de Temperatura (DGPT2/Termístor)',
          'Alarme de Gás/Pressão',
          'Ventilação Forçada',
          'Nível de Óleo'
        ]
      },
      {
        id: 'pv_system',
        label: 'Sistema Fotovoltaico',
        defaultCategory: 'Electrical',
        options: [
          'Produção de Energia Ativa (kWh)',
          'Potência Instantânea (kW)',
          'Estado dos Inversores (Modbus)',
          'Sensor de Irradiação Solar',
          'Temperatura dos Módulos'
        ]
      },
      {
        id: 'ev_charger',
        label: 'Carregamento Veículos Elétricos',
        defaultCategory: 'Electrical',
        options: [
          'Estado dos Carregadores',
          'Consumo por Posto',
          'Gestão de Carga (Load Shedding)',
          'Alarme de Proteção Diferencial'
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
        label: 'Grupo de Bombagem (Águas Limpas)',
        defaultCategory: 'Plumbing',
        options: [
          'Bombas de Velocidade Variável (VEX)',
          'Alternância de Bombas',
          'Pressostato de Falta de Água',
          'Transdutor de Pressão (4-20mA)',
          'Válvula de Enchimento Automático',
          'Contador de Água Geral'
        ]
      },
      {
        id: 'sewage',
        label: 'Estação Elevatória (Esgotos)',
        defaultCategory: 'Plumbing',
        options: [
          'Bombas Submersíveis (1 ou 2)',
          'Bóias de Nível (Min, Arranque, Max, Alarme)',
          'Sonda de Nível Ultrassónica/Hidrostática',
          'Válvula de Retenção',
          'Alarme de Nível Muito Alto',
          'Triturador'
        ]
      },
      {
        id: 'rainwater',
        label: 'Aproveitamento de Águas Pluviais',
        defaultCategory: 'Plumbing',
        options: [
          'Nível do Reservatório Pluvial',
          'Bomba de Trasfega',
          'Filtro Automático',
          'Comutação Água Rede/Pluvial',
          'Contador de Água Recuperada'
        ]
      },
      {
        id: 'dhw',
        label: 'Produção AQS',
        defaultCategory: 'Plumbing',
        options: [
          'Depósito de Acumulação',
          'Bomba de Circulação AQS (Retorno)',
          'Resistência Elétrica de Apoio',
          'Controlo de Legionella (Ciclo Térmico)',
          'Válvula Misturadora Termostática',
          'Ânodo de Magnésio Eletrónico'
        ]
      },
      {
        id: 'fire_fighting',
        label: 'Central de Bombagem de Incêndio (CBI)',
        defaultCategory: 'Plumbing',
        options: [
          'Bomba Principal Elétrica',
          'Bomba Principal Diesel',
          'Bomba Jockey',
          'Estado das Válvulas de Corte',
          'Nível do Reservatório de Incêndio',
          'Alarmes de Pressão da Rede',
          'Sinal "Bomba em Funcionamento"'
        ]
      },
      {
        id: 'irrigation',
        label: 'Sistema de Rega',
        defaultCategory: 'Plumbing',
        options: [
          'Programador de Rega',
          'Eletroválvulas de Zona',
          'Sensor de Chuva / Humidade Solo',
          'Contador de Água de Rega'
        ]
      },
      {
        id: 'solar',
        label: 'Solar Térmico',
        defaultCategory: 'Plumbing',
        options: [
          'Temperatura dos Coletores',
          'Temperatura do Depósito',
          'Bomba do Primário Solar',
          'Dissipador de Calor (Aerotermo)',
          'Contador de Energia Térmica'
        ]
      },
      {
        id: 'pool',
        label: 'Tratamento de Piscina',
        defaultCategory: 'Plumbing',
        options: [
          'Bomba de Circulação/Filtração',
          'Leitura de pH',
          'Leitura de Cloro/Redox',
          'Temperatura da Água',
          'Alarme de Pressão (Filtro Sujo)',
          'Dosagem de Produtos Químicos'
        ]
      }
    ]
  }
];

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0);
  const [selectedEquipmentIdx, setSelectedEquipmentIdx] = useState<number>(0);
  const [tag, setTag] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
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
        quantity: Math.max(1, quantity),
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
    setQuantity(1);
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

                {/* Step 2: Identification & Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <label htmlFor="tag" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      3. Identificação (Tag / Local)
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm truncate max-w-[120px]">
                        {currentEquipment.label}
                      </span>
                      <input
                        type="text"
                        id="tag"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 border"
                        placeholder="Ex: Piso 2, Sala Reuniões"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="quantity" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Qtd.
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <div className="relative flex items-stretch flex-grow focus-within:z-10">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Layers className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="quantity"
                          id="quantity"
                          min="1"
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md pl-10 sm:text-sm border-gray-300 border py-2"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          disabled={isGenerating}
                        />
                      </div>
                    </div>
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