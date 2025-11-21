
import React, { useMemo } from 'react';
import { Equipment, PointType, ProjectInfo } from '../types';
import { X, Printer, FileText, MapPin, User, Building, Activity, Power, Zap, Sliders, Network } from 'lucide-react';

interface ReportPreviewProps {
  equipmentList: Equipment[];
  projectInfo: ProjectInfo;
  onClose: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ equipmentList, projectInfo, onClose }) => {
  
  const handlePrint = () => {
    window.print();
  };

  // Calculate Global Stats
  const stats = useMemo(() => {
    let di = 0, do_ = 0, ai = 0, ao = 0, integrated = 0;
    
    equipmentList.forEach(eq => {
      const qty = eq.quantity || 1;
      
      eq.points.forEach(p => {
        // Logic to detect "integrated" points (virtual or via communication protocols)
        const isComm = 
          p.type === PointType.VIRTUAL || 
          p.description.toLowerCase().includes('modbus') ||
          p.description.toLowerCase().includes('bacnet') ||
          p.description.toLowerCase().includes('comunicação') ||
          p.signalType?.toLowerCase().includes('modbus') ||
          p.signalType?.toLowerCase().includes('bacnet');

        if (isComm) {
          integrated += qty;
        } else {
          // Only count as physical if not integrated/virtual
          if (p.type === PointType.DI) di += qty;
          else if (p.type === PointType.DO) do_ += qty;
          else if (p.type === PointType.AI) ai += qty;
          else if (p.type === PointType.AO) ao += qty;
        }
      });
    });

    const totalPhysical = di + do_ + ai + ao;
    
    return { di, do: do_, ai, ao, integrated, totalPhysical, total: di + do_ + ai + ao + integrated };
  }, [equipmentList]);

  return (
    <div className="fixed inset-0 z-[60] bg-gray-100 overflow-y-auto print:overflow-visible print:bg-white print:inset-auto print:h-auto print:z-auto">
      
      {/* Toolbar - Hidden on print */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center print:hidden z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pré-visualização do Relatório</h2>
            <p className="text-xs text-gray-500">{equipmentList.length} equipamentos incluídos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Fechar
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="max-w-[210mm] mx-auto mt-24 mb-10 bg-white shadow-xl print:shadow-none print:m-0 print:w-full print:max-w-none">
        
        {/* 1. COVER PAGE */}
        <div className="min-h-[297mm] p-[20mm] flex flex-col justify-between border-b print:border-none relative">
          <div className="mt-20">
             <div className="w-24 h-24 bg-blue-700 rounded-full flex items-center justify-center mb-8 shadow-lg">
                <span className="text-white font-bold text-3xl">K</span>
             </div>
             <p className="text-sm text-gray-500 tracking-widest uppercase mb-2">K-SIMSACE Specification Report</p>
             <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
               {projectInfo.projectName || 'Projeto Sem Nome'}
             </h1>
             <h2 className="text-2xl text-gray-500 font-light flex items-center gap-2">
               <MapPin className="w-6 h-6" />
               {projectInfo.location || 'Localização não definida'}
             </h2>
          </div>

          <div className="mb-20 grid grid-cols-2 gap-8">
            <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalhes do Cliente</h3>
               <div className="border-l-4 border-blue-600 pl-4 py-1">
                 <p className="text-lg font-medium text-gray-900">{projectInfo.clientName || 'Cliente Final'}</p>
               </div>
            </div>

            <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Técnico Responsável</h3>
               <div className="border-l-4 border-gray-300 pl-4 py-1">
                 <p className="text-lg font-medium text-gray-900">{projectInfo.technicianName || 'Técnico'}</p>
                 <p className="text-sm text-gray-500">{projectInfo.technicianCompany || 'Empresa'}</p>
               </div>
            </div>

            <div className="col-span-2 mt-8 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Data de Emissão</p>
              <p className="text-xl font-medium text-gray-900">
                {new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Page break for print */}
          <div className="break-after-page"></div>
        </div>

        {/* 2. INDEX & SUMMARY PAGE */}
        <div className="min-h-[297mm] p-[20mm] print:break-before-page">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-100">Resumo e Índice</h3>
          
          {/* Executive Summary Stats */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
               <Activity className="w-5 h-5 text-gray-600" />
               <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Resumo Global de Hardware</h4>
             </div>
             
             <div className="grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                   <span className="text-2xl font-bold text-green-600">{stats.di}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">DI (Input)</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                   <span className="text-2xl font-bold text-orange-600">{stats.do}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">DO (Output)</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                   <span className="text-2xl font-bold text-blue-600">{stats.ai}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">AI (Analog)</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                   <span className="text-2xl font-bold text-purple-600">{stats.ao}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">AO (Analog)</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                   <span className="text-2xl font-bold text-gray-600">{stats.integrated}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Integrados</span>
                </div>
             </div>
             
             <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-500">Total de Equipamentos: <strong>{equipmentList.length}</strong></span>
                <span className="font-bold text-gray-800">Total Geral de Pontos: {stats.total}</span>
             </div>
          </div>

          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Índice de Equipamentos</h4>
          <div className="space-y-2">
            {equipmentList.map((eq, index) => (
              <div key={eq.id} className="flex items-baseline justify-between border-b border-gray-50 py-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-gray-400 font-mono w-8 text-right">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-gray-800 font-medium">{eq.name}</span>
                  {(eq.quantity || 1) > 1 && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Qtd: {eq.quantity}</span>
                  )}
                </div>
                <span className="text-gray-400 text-sm hidden print:block">...</span>
              </div>
            ))}
          </div>
           <div className="break-after-page"></div>
        </div>

        {/* 3. CONTENT PAGES */}
        <div className="print:break-before-page">
          {equipmentList.map((eq, index) => {
            const qty = eq.quantity || 1;
            const diCount = eq.points.filter(x => x.type === PointType.DI).length;
            const doCount = eq.points.filter(x => x.type === PointType.DO).length;
            const aiCount = eq.points.filter(x => x.type === PointType.AI).length;
            const aoCount = eq.points.filter(x => x.type === PointType.AO).length;

            return (
              <div key={eq.id} className="p-[20mm] min-h-[297mm] flex flex-col break-inside-avoid print:break-after-page">
                {/* Header for Equipment */}
                <div className="mb-8 pb-4 border-b-2 border-blue-600 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">{eq.category}</span>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      {eq.name}
                      {qty > 1 && (
                        <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full border font-normal align-middle">
                          Quantidade: {qty}
                        </span>
                      )}
                    </h2>
                  </div>
                  <span className="text-4xl font-bold text-gray-100 select-none">{String(index + 1).padStart(2, '0')}</span>
                </div>

                {/* Description */}
                {eq.description && (
                   <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-100 text-sm text-gray-600">
                     <strong>Configuração:</strong> {eq.description}
                   </div>
                )}

                {/* Points Table */}
                <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-800">
                        <th className="py-2 text-xs uppercase font-bold text-gray-600 w-24">Tipo</th>
                        <th className="py-2 text-xs uppercase font-bold text-gray-600">Nome do Ponto</th>
                        <th className="py-2 text-xs uppercase font-bold text-gray-600">Descrição Funcional</th>
                        <th className="py-2 text-xs uppercase font-bold text-gray-600 w-24">Sinal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eq.points.map((p, pIdx) => (
                        <tr key={p.id} className={`border-b border-gray-200 ${pIdx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50 print:bg-transparent'}`}>
                          <td className="py-3 text-xs font-bold text-gray-700">
                             <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                                p.type === PointType.DI ? 'bg-green-50 border-green-200 text-green-700' :
                                p.type === PointType.DO ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                p.type === PointType.AI ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                p.type === PointType.AO ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                'bg-gray-50 border-gray-200 text-gray-700'
                             }`}>
                               {p.type}
                             </span>
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900">{p.name}</td>
                          <td className="py-3 text-sm text-gray-600">{p.description}</td>
                          <td className="py-3 text-xs text-gray-500 font-mono">{p.signalType || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-8">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Totais para este tipo de equipamento ({qty} unidades):</p>
                    <div className="grid grid-cols-4 gap-4 text-center text-xs text-gray-500 border-t border-gray-200 pt-4 bg-gray-50 rounded-lg p-4">
                        <div>
                          <span className="block font-bold text-gray-900 text-lg">{diCount * qty}</span>
                          DI (Total)
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900 text-lg">{doCount * qty}</span>
                          DO (Total)
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900 text-lg">{aiCount * qty}</span>
                          AI (Total)
                        </div>
                        <div>
                          <span className="block font-bold text-gray-900 text-lg">{aoCount * qty}</span>
                          AO (Total)
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">* Os valores acima representam a soma total dos pontos I/O para as {qty} unidades.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. BACK COVER */}
        <div className="min-h-[297mm] bg-gray-900 text-white p-[20mm] flex flex-col justify-center items-center print:break-before-page">
           <div className="text-center">
             <h2 className="text-3xl font-bold mb-4">K-SIMSACE</h2>
             <p className="text-gray-400 mb-8">Smart Integration & Management System</p>
             <p className="text-sm text-gray-500">Documento técnico gerado para efeitos de projeto e obra.</p>
             <div className="mt-12 w-16 h-1 bg-blue-600 mx-auto"></div>
           </div>
        </div>

      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
          }
          /* Hide scrollbars in print */
          ::-webkit-scrollbar {
            display: none;
          }
          /* Ensure background colors print */
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          /* Page break utilities */
          .break-after-page {
            page-break-after: always;
          }
          .break-before-page {
            page-break-before: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportPreview;
