import React from 'react';
import { Equipment } from '../types';
import { Plus, Server, Trash2, Cpu } from 'lucide-react';

interface SidebarProps {
  equipmentList: Equipment[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string) => void;
  onAddEquipment: () => void;
  onDeleteEquipment: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  equipmentList,
  selectedEquipmentId,
  onSelectEquipment,
  onAddEquipment,
  onDeleteEquipment,
}) => {
  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">GTC Studio</h1>
        </div>
        <p className="text-xs text-gray-500">Gestão de Pontos Técnicos</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Equipamentos</h2>
          <button
            onClick={onAddEquipment}
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
            title="Novo Equipamento"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {equipmentList.length === 0 ? (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500 mb-2">Sem equipamentos</p>
            <button 
              onClick={onAddEquipment}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Adicionar o primeiro
            </button>
          </div>
        ) : (
          equipmentList.map((eq) => (
            <div
              key={eq.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
                selectedEquipmentId === eq.id
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
              }`}
              onClick={() => onSelectEquipment(eq.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Server className={`w-5 h-5 flex-shrink-0 ${selectedEquipmentId === eq.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-sm font-medium truncate ${selectedEquipmentId === eq.id ? 'text-blue-900' : 'text-gray-700'}`}>
                    {eq.name}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {eq.points.length} pontos
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEquipment(eq.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-center text-gray-400">
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default Sidebar;