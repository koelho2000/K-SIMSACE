import React, { useState } from 'react';
import { Equipment, GtcPoint, PointType } from '../types';
import { Download, Plus, Save, Zap, Sliders, Activity, Power, AlertCircle, FileText } from 'lucide-react';
import { generatePointsForEquipment } from '../services/geminiService';

interface PointListProps {
  equipment: Equipment;
  onUpdateEquipment: (updatedEquipment: Equipment) => void;
}

const PointList: React.FC<PointListProps> = ({ equipment, onUpdateEquipment }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptContext, setPromptContext] = useState('');

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const newPoints = await generatePointsForEquipment(equipment.name, promptContext || 'Adicione mais pontos relevantes que possam estar em falta.');
      // Filter out duplicates by name
      const existingNames = new Set(equipment.points.map(p => p.name.toLowerCase()));
      const uniqueNewPoints = newPoints.filter(p => !existingNames.has(p.name.toLowerCase()));
      
      onUpdateEquipment({
        ...equipment,
        points: [...equipment.points, ...uniqueNewPoints]
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar pontos. Verifique a sua ligação ou tente novamente.");
    } finally {
      setIsGenerating(false);
      setPromptContext('');
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Tipo', 'Descrição', 'Sinal', 'Unidade'];
    const rows = equipment.points.map(p => [
      `"${p.name}"`,
      p.type,
      `"${p.description}"`,
      `"${p.signalType || ''}"`,
      `"${p.unit || ''}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pontos_gtc_${equipment.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeColor = (type: PointType) => {
    switch (type) {
      case PointType.DI: return 'bg-green-100 text-green-800 border-green-200';
      case PointType.DO: return 'bg-orange-100 text-orange-800 border-orange-200';
      case PointType.AI: return 'bg-blue-100 text-blue-800 border-blue-200';
      case PointType.AO: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: PointType) => {
    switch (type) {
      case PointType.DI: return <Activity className="w-3 h-3 mr-1" />;
      case PointType.DO: return <Power className="w-3 h-3 mr-1" />;
      case PointType.AI: return <Zap className="w-3 h-3 mr-1" />;
      case PointType.AO: return <Sliders className="w-3 h-3 mr-1" />;
      default: return <FileText className="w-3 h-3 mr-1" />;
    }
  };

  const handleDeletePoint = (pointId: string) => {
    onUpdateEquipment({
      ...equipment,
      points: equipment.points.filter(p => p.id !== pointId)
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{equipment.name}</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 uppercase">
              {equipment.category}
            </span>
            <span className="text-gray-400">•</span>
            <span>{equipment.points.length} Pontos</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Ponto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Unidade</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipment.points.map((point) => (
                <tr key={point.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getTypeColor(point.type)}`}>
                      {getTypeIcon(point.type)}
                      {point.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {point.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={point.description}>
                    {point.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {point.signalType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {point.unit || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDeletePoint(point.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover ponto"
                    >
                      <span className="sr-only">Delete</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              
              {equipment.points.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">Sem pontos definidos</p>
                      <p className="text-sm text-gray-500 mt-1">Utilize a IA abaixo para gerar sugestões.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* AI Generation Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Assistente de Pontos Inteligente</h3>
              <p className="text-sm text-gray-600 mt-1 mb-4">
                Deseja refinar a lista ou adicionar componentes específicos? Descreva o que falta (ex: "Adicionar alarmes de alta pressão" ou "Incluir medição de energia") e a IA irá sugerir os pontos técnicos adequados.
              </p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Ex: Adicionar comunicação Modbus e alarme de falha geral..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                  value={promptContext}
                  onChange={(e) => setPromptContext(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateMore()}
                />
                <button
                  onClick={handleGenerateMore}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      A Gerar...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Gerar Sugestões
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointList;