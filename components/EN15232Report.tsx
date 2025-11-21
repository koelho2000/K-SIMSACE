import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, ShieldCheck, AlertTriangle, CheckCircle, Award, RefreshCcw, Building2, Ruler, Zap, Settings, Activity, Power, Sliders, Network } from 'lucide-react';
import { Equipment, EN15232Analysis, ProjectInfo, EN15232ChecklistItem, PointType } from '../types';
import { analyzeProjectEN15232 } from '../services/geminiService';

interface EN15232ReportProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
  projectName: string;
  projectInfo?: ProjectInfo;
}

const EN15232Report: React.FC<EN15232ReportProps> = ({ isOpen, onClose, equipmentList, projectName, projectInfo }) => {
  const [analysis, setAnalysis] = useState<EN15232Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if building data is missing
  const isMissingBuildingData = !projectInfo || !projectInfo.buildingType || !projectInfo.estimatedArea;

  // Calculate Stats
  const stats = useMemo(() => {
    let di = 0, do_ = 0, ai = 0, ao = 0, integrated = 0;
    
    equipmentList.forEach(eq => {
      const qty = eq.quantity || 1;
      
      eq.points.forEach(p => {
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

  useEffect(() => {
    // Added isMissingBuildingData and projectInfo to dependencies to re-run when data is corrected
    if (isOpen && !isLoading && !isMissingBuildingData) {
      handleAnalyze();
    }
  }, [isOpen, isMissingBuildingData, projectInfo]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeProjectEN15232(equipmentList, projectInfo);
      if (result) {
        setAnalysis(result);
      } else {
        setError("Não foi possível gerar a análise. Adicione equipamentos ao projeto primeiro.");
      }
    } catch (e) {
      setError("Erro ao contactar a IA para validação normativa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getClassColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200';
      case 'B': return 'bg-green-400 text-white border-green-500 shadow-green-200';
      case 'C': return 'bg-yellow-400 text-black border-yellow-500 shadow-yellow-200';
      case 'D': return 'bg-red-500 text-white border-red-600 shadow-red-200';
      default: return 'bg-gray-300';
    }
  };

  if (!isOpen) return null;

  // Group checklist items by category for display
  const groupedChecklist = (analysis?.checklist || []).reduce((acc, item) => {
    const cat = item.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, EN15232ChecklistItem[]>);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 print:bg-white print:overflow-visible">
      
      {/* Toolbar - Hidden on Print */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Certificação EN 15232</h2>
            <p className="text-xs text-gray-500">Auditoria de Eficiência Energética (BACS)</p>
          </div>
        </div>
        <div className="flex gap-3">
           {analysis && !isLoading && (
             <button
              onClick={handleAnalyze}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Reavaliar
            </button>
           )}
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Fechar
          </button>
          <button 
            onClick={handlePrint}
            disabled={isLoading || !analysis || isMissingBuildingData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="mt-20 max-w-[210mm] mx-auto shadow-xl print:shadow-none print:m-0 print:w-full">
        
        {isMissingBuildingData ? (
           <div className="flex flex-col items-center justify-center h-[600px] bg-white p-8 text-center">
             <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
               <Building2 className="w-10 h-10 text-amber-600" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Dados do Edifício em Falta</h3>
             <p className="text-gray-600 max-w-md mb-8">
               Para realizar uma certificação EN 15232 realista, é necessário definir a <strong>Tipologia</strong>, <strong>Área</strong> e <strong>Potência Térmica</strong> do edifício.
             </p>
             <button 
               onClick={onClose} 
               className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
             >
               <Settings className="w-5 h-5 mr-2" />
               Configurar Dados do Projeto
             </button>
           </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-[600px] bg-white">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
            <p className="text-xl text-gray-800 font-bold">A Auditar Projeto...</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
              A IA está a verificar a conformidade com a norma EN 15232-1:2017 com base na tipologia <strong>{projectInfo?.buildingType}</strong> e equipamentos definidos.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-center bg-white">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
            <p className="text-lg text-gray-900 font-bold">{error}</p>
            <button onClick={handleAnalyze} className="mt-4 text-blue-600 hover:underline">Tentar Novamente</button>
          </div>
        ) : analysis ? (
          <>
            {/* PAGE 1: CERTIFICATE (A4) */}
            <div className="bg-white min-h-[297mm] p-[20mm] relative box-border flex flex-col justify-between border border-gray-200 print:border-none print:break-after-page">
               
               {/* Background Watermark/Border */}
               <div className="absolute inset-0 border-[12px] border-double border-gray-100 m-4 pointer-events-none"></div>
               
               {/* 1. Header with Logo */}
               <div className="text-center relative z-10 pt-4">
                 <div className="flex justify-center mb-6">
                    {/* Logo Placeholder - using SVG for reliability but styled as requested */}
                    <div className="flex items-center justify-center gap-3">
                        <div className="relative w-16 h-16">
                           <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3 opacity-20"></div>
                           <div className="absolute inset-0 bg-emerald-500 rounded-lg transform -rotate-3 opacity-20"></div>
                           <div className="relative bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2">
                                <path d="M9 6l6 6-6 6" className="text-blue-600" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 12h14" className="text-emerald-500" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/>
                                <circle cx="5" cy="12" r="2" className="text-emerald-600" fill="currentColor"/>
                                <circle cx="19" cy="12" r="2" className="text-blue-600" fill="currentColor"/>
                              </svg>
                           </div>
                        </div>
                        <div className="text-left">
                           <h1 className="text-2xl font-bold tracking-tight text-gray-900">K-SIMSACE</h1>
                           <p className="text-[10px] text-gray-500 uppercase tracking-wider">Intelligent BMS Solutions</p>
                        </div>
                    </div>
                 </div>
                 
                 <div className="mt-12">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 uppercase tracking-widest mb-3">Certificado de Eficiência</h1>
                    <div className="h-0.5 w-32 bg-emerald-600 mx-auto my-4"></div>
                    <p className="text-sm font-bold text-emerald-800 uppercase tracking-[0.2em]">
                    Building Automation & Control Systems (BACS)
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-mono">EN 15232-1:2017 COMPLIANCE REPORT</p>
                 </div>
               </div>

               {/* 2. Classification Main */}
               <div className="flex flex-col items-center my-8 relative z-10">
                  <div className="relative">
                     {/* Outer Ring */}
                     <div className={`w-48 h-48 rounded-full flex items-center justify-center text-8xl font-black border-[8px] shadow-2xl ${getClassColor(analysis.projectClass)}`}>
                        {analysis.projectClass}
                     </div>
                     <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-gray-200">
                        <span className="text-xs font-bold text-gray-600 uppercase">Classe Global</span>
                     </div>
                  </div>
                  
                  <div className="mt-8 max-w-lg text-center">
                     <p className="text-gray-600 italic leading-relaxed">
                       "{analysis.projectClass === 'A' ? 'Sistema de Alta Eficiência Energética com funções TBM avançadas.' : 
                         analysis.projectClass === 'B' ? 'Sistema Avançado com gestão otimizada e controlo específico.' : 
                         analysis.projectClass === 'C' ? 'Sistema Standard de referência (requisito mínimo atual).' : 'Sistema Não Eficiente. Requer atualização urgente de funções de controlo.'}"
                     </p>
                  </div>
               </div>

               {/* 3. Building Info Grid */}
               <div className="bg-gray-50 rounded-xl p-8 relative z-10 border border-gray-200 mx-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 text-center">Dados do Edifício Analisado</h3>
                  <div className="grid grid-cols-3 gap-8 text-center divide-x divide-gray-200">
                     <div>
                        <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 uppercase">Tipologia</p>
                        <p className="font-bold text-gray-900">{projectInfo?.buildingType || 'N/D'}</p>
                     </div>
                     <div>
                        <Ruler className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 uppercase">Área Total</p>
                        <p className="font-bold text-gray-900">{projectInfo?.estimatedArea ? `${projectInfo.estimatedArea} m²` : 'N/D'}</p>
                     </div>
                     <div>
                        <Zap className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 uppercase">Potência Térmica</p>
                        <p className="font-bold text-gray-900">{projectInfo?.thermalPower ? `${projectInfo.thermalPower} kW` : 'N/D'}</p>
                     </div>
                  </div>
               </div>

               {/* 4. Footer Signatures */}
               <div className="mt-auto relative z-10 pb-4">
                  <div className="flex justify-between items-end px-8">
                     <div className="text-left">
                        <p className="text-xl font-bold text-gray-900">{projectName}</p>
                        <p className="text-sm text-gray-500">{projectInfo?.location}</p>
                        <p className="text-xs text-gray-400 mt-2">ID: {crypto.randomUUID().split('-')[0].toUpperCase()}</p>
                     </div>
                     
                     <div className="text-right min-w-[250px]">
                        <div className="border-b border-gray-900 mb-2 pb-2">
                           {/* Signature Simulation */}
                           <p className="font-handwriting text-2xl text-blue-900 opacity-80 italic pr-4">
                             {projectInfo?.technicianName?.split(' ')[0] || 'Assinatura'}
                           </p>
                        </div>
                        <p className="text-xs font-bold text-gray-900 uppercase">Entidade Certificadora / Técnico</p>
                        <div className="text-xs text-gray-600 mt-1">
                           <p><span className="font-semibold">Nome:</span> {projectInfo?.technicianName || '____________________'}</p>
                           <p><span className="font-semibold">Empresa:</span> {projectInfo?.technicianCompany || '____________________'}</p>
                        </div>
                     </div>
                  </div>
                  <div className="text-center mt-8 text-[10px] text-gray-300">
                     Documento gerado automaticamente por K-SIMSACE • Análise baseada em IA e Normas EN 15232
                  </div>
               </div>
            </div>

            {/* PAGE 2+: DETAILED CHECKLIST */}
            <div className="bg-white min-h-[297mm] p-[20mm] border border-gray-200 print:border-none mt-8 print:mt-0 print:break-before-page">
              <div className="mb-6 pb-4 border-b-2 border-gray-900 flex justify-between items-end">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Verificação Detalhada de Funções</h2>
                   <p className="text-sm text-gray-500">Conformidade técnica detalhada por sistema</p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs text-gray-500 block mb-1">Classe Atribuída</span>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-white text-sm ${analysis.projectClass === 'A' ? 'bg-emerald-500' : analysis.projectClass === 'B' ? 'bg-green-500' : analysis.projectClass === 'C' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {analysis.projectClass}
                    </span>
                 </div>
              </div>

              {/* --- POINT SUMMARY SECTION ADDED HERE --- */}
              <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-5">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Activity className="w-4 h-4" /> Resumo de Hardware & Pontos de Controlo
                 </h3>
                 <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-2 bg-white rounded border border-green-200">
                       <span className="block text-xl font-bold text-green-600">{stats.di}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase">DI (Inputs)</span>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-orange-200">
                       <span className="block text-xl font-bold text-orange-600">{stats.do}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase">DO (Outputs)</span>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-blue-200">
                       <span className="block text-xl font-bold text-blue-600">{stats.ai}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase">AI (Analog)</span>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-purple-200">
                       <span className="block text-xl font-bold text-purple-600">{stats.ao}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase">AO (Analog)</span>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-gray-200">
                       <span className="block text-xl font-bold text-gray-600">{stats.integrated}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase">Integrados</span>
                    </div>
                 </div>
                 <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Base de cálculo para análise da norma EN 15232</span>
                    <span className="text-sm font-bold text-slate-800">Total Geral de Pontos: {stats.total}</span>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600 shadow-sm text-sm text-slate-700 mb-6 italic">
                   <strong>Resumo da Auditoria:</strong> {analysis.summary}
                </div>

                {Object.entries(groupedChecklist).map(([category, items], idx) => (
                  <div key={idx} className="break-inside-avoid mb-6">
                    <h3 className="bg-gray-100 text-gray-800 px-4 py-2 text-xs font-bold uppercase tracking-wide border-l-4 border-gray-400 mb-2">
                      {category}
                    </h3>
                    <table className="min-w-full text-sm border-collapse">
                      <thead className="border-b border-gray-200">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold text-gray-500 w-1/3 text-xs uppercase">Função de Controlo</th>
                          <th className="px-2 py-2 text-center font-semibold text-gray-500 w-24 text-xs uppercase">Estado</th>
                          <th className="px-2 py-2 text-left font-semibold text-gray-500 text-xs uppercase">Evidência / Observação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-2 py-3 font-medium text-gray-900 align-top">{item.function}</td>
                            <td className="px-2 py-3 text-center align-top">
                              {item.status === 'COMPLIANT' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  CONFORME
                                </span>
                              )}
                              {item.status === 'PARTIAL' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  PARCIAL
                                </span>
                              )}
                              {item.status === 'NON_COMPLIANT' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                  N/C
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-3 text-gray-600 text-xs leading-relaxed align-top">
                              {item.observation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100 break-inside-avoid print:break-before-page">
                    <h4 className="text-sm font-bold text-blue-900 uppercase mb-4 flex items-center gap-2">
                       <Zap className="w-4 h-4" /> Plano de Melhoria de Eficiência
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {(analysis.recommendations as any[]).map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default EN15232Report;