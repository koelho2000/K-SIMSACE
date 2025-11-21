
import React, { useRef } from 'react';
import { Equipment } from '../types';
import { Plus, Server, Trash2, Cpu, PieChart, FileText, Calculator, Copy, Settings, Download, Upload, Edit2, FilePlus, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  equipmentList: Equipment[];
  selectedEquipmentId: string | null;
  onSelectEquipment: (id: string) => void;
  onAddEquipment: () => void;
  onDeleteEquipment: (id: string) => void;
  onDuplicateEquipment: (id: string) => void;
  onEditEquipment: (id: string) => void;
  onOpenSummary: () => void;
  onOpenReport: () => void;
  onOpenBudget: () => void;
  onOpenEN15232: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onNewProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  equipmentList,
  selectedEquipmentId,
  onSelectEquipment,
  onAddEquipment,
  onDeleteEquipment,
  onDuplicateEquipment,
  onEditEquipment,
  onOpenSummary,
  onOpenReport,
  onOpenBudget,
  onOpenEN15232,
  onOpenSettings,
  onExport,
  onImport,
  onNewProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full print:hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-700 rounded-lg shadow-md">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">K-SIMSACE</h1>
        </div>
        <p className="text-xs text-gray-500">Smart Integration & Management System</p>
      </div>

      {/* Project Actions */}
      <div className="p-4 border-b border-gray-200 grid grid-cols-4 gap-2">
         <button 
           onClick={onNewProject}
           className="flex flex-col items-center justify-center p-2 rounded hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
           title="Novo Projeto (Apagar Tudo)"
         >
           <FilePlus className="w-5 h-5 mb-1" />
           <span className="text-[10px] font-medium">Novo</span>
         </button>
         <button 
           onClick={onOpenSettings}
           className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
           title="Definições do Projeto"
         >
           <Settings className="w-5 h-5 mb-1" />
           <span className="text-[10px] font-medium">Projeto</span>
         </button>
         <button 
           onClick={onExport}
           className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
           title="Exportar JSON"
         >
           <Download className="w-5 h-5 mb-1" />
           <span className="text-[10px] font-medium">Exportar</span>
         </button>
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
           title="Importar JSON"
         >
           <Upload className="w-5 h-5 mb-1" />
           <span className="text-[10px] font-medium">Importar</span>
         </button>
         <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
         />
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
                  <div className="flex items-center gap-2">
                     {(eq.quantity > 1) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {eq.quantity}x
                        </span>
                     )}
                    <span className={`text-sm font-medium truncate ${selectedEquipmentId === eq.id ? 'text-blue-900' : 'text-gray-700'}`}>
                      {eq.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 truncate">
                    {eq.points.length} pontos {eq.quantity > 1 && `(Total: ${eq.points.length * eq.quantity})`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEquipment(eq.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all mr-1"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateEquipment(eq.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all mr-1"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEquipment(eq.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
         <button 
          onClick={onOpenEN15232}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-md hover:bg-emerald-200 shadow-sm transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          Verificação EN 15232
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onOpenSummary}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors"
          >
            <PieChart className="w-3 h-3 text-blue-600" />
            Resumo
          </button>
          <button 
            onClick={onOpenReport}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors"
          >
            <FileText className="w-3 h-3 text-blue-600" />
            Relatório
          </button>
        </div>
        <button 
          onClick={onOpenBudget}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all"
        >
          <Calculator className="w-4 h-4" />
          Orçamento Estimativo
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
