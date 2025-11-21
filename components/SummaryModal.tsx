import React, { useMemo } from 'react';
import { X, Activity, Power, Zap, Sliders, Network, Cpu } from 'lucide-react';
import { Equipment, PointType } from '../types';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, equipmentList }) => {
  
  const stats = useMemo(() => {
    let di = 0, do_ = 0, ai = 0, ao = 0, integrated = 0;
    
    equipmentList.forEach(eq => {
      const qty = eq.quantity || 1;
      
      eq.points.forEach(p => {
        if (p.type === PointType.DI) di += qty;
        else if (p.type === PointType.DO) do_ += qty;
        else if (p.type === PointType.AI) ai += qty;
        else if (p.type === PointType.AO) ao += qty;
        
        // Logic to detect "integrated" points (virtual or via communication protocols)
        const isComm = 
          p.type === PointType.VIRTUAL || 
          p.description.toLowerCase().includes('modbus') ||
          p.description.toLowerCase().includes('bacnet') ||
          p.description.toLowerCase().includes('comunicação') ||
          p.signalType?.toLowerCase().includes('modbus') ||
          p.signalType?.toLowerCase().includes('bacnet');
          
        if (isComm) integrated += qty;
      });
    });

    const totalPhysical = di + do_ + ai + ao;
    
    return { di, do: do_, ai, ao, integrated, totalPhysical, total: di + do_ + ai + ao + integrated };
  }, [equipmentList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="summary-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full sm:p-6">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center gap-2" id="summary-title">
              <Activity className="w-6 h-6 text-blue-600" />
              Resumo do Projeto GTC
            </h3>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100">
              <span className="block text-4xl font-bold text-blue-600 mb-2">{equipmentList.length}</span>
              <span className="text-sm font-medium text-blue-900 uppercase tracking-wide">Linhas de Equipamento</span>
            </div>
            <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-100">
              <span className="block text-4xl font-bold text-indigo-600 mb-2">{stats.total}</span>
              <span className="text-sm font-medium text-indigo-900 uppercase tracking-wide">Total de Pontos</span>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100">
              <span className="block text-4xl font-bold text-green-600 mb-2">{stats.totalPhysical}</span>
              <span className="text-sm font-medium text-green-900 uppercase tracking-wide">Pontos Físicos (I/O)</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Detalhe por Tipo de Ponto (Global)</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="p-4 rounded-lg border border-green-200 bg-green-50 flex flex-col items-center">
              <Activity className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-2xl font-bold text-green-700">{stats.di}</span>
              <span className="text-xs text-green-800 mt-1 font-medium">DI (Digital In)</span>
            </div>

            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 flex flex-col items-center">
              <Power className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-2xl font-bold text-orange-700">{stats.do}</span>
              <span className="text-xs text-orange-800 mt-1 font-medium">DO (Digital Out)</span>
            </div>

            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 flex flex-col items-center">
              <Zap className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-2xl font-bold text-blue-700">{stats.ai}</span>
              <span className="text-xs text-blue-800 mt-1 font-medium">AI (Analog In)</span>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 flex flex-col items-center">
              <Sliders className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-2xl font-bold text-purple-700">{stats.ao}</span>
              <span className="text-xs text-purple-800 mt-1 font-medium">AO (Analog Out)</span>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center col-span-2 md:col-span-1">
              <Network className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-2xl font-bold text-gray-700">{stats.integrated}</span>
              <span className="text-xs text-gray-800 mt-1 font-medium">Integração/Soft</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mb-6">
             <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Detalhamento por Equipamento</h4>
             <div className="border rounded-lg overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipamento</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pontos/Un</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Pontos</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {equipmentList.map(eq => (
                     <tr key={eq.id} className="hover:bg-gray-50">
                       <td className="px-4 py-2 text-sm text-gray-900">{eq.name}</td>
                       <td className="px-4 py-2 text-sm text-gray-600 text-right">{eq.quantity}</td>
                       <td className="px-4 py-2 text-sm text-gray-600 text-right">{eq.points.length}</td>
                       <td className="px-4 py-2 text-sm font-bold text-blue-600 text-right">
                         {eq.points.length * eq.quantity}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
             <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Cpu className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Nota Técnica</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Os totais globais apresentados acima são calculados automaticamente multiplicando o número de pontos de cada equipamento pela sua respetiva quantidade definida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              onClick={onClose}
            >
              Fechar Resumo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;