import React, { useState, useEffect } from 'react';
import { X, Printer, Calculator, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { Equipment, BudgetProposal, BudgetItem } from '../types';
import { generateBudgetProposal } from '../services/geminiService';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, equipmentList }) => {
  const [proposal, setProposal] = useState<BudgetProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !proposal && !isLoading) {
      handleGenerateBudget();
    }
  }, [isOpen]);

  const handleGenerateBudget = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateBudgetProposal(equipmentList);
      if (result) {
        setProposal(result);
      } else {
        setError("Não foi possível gerar o orçamento. Verifique a API Key.");
      }
    } catch (e) {
      setError("Ocorreu um erro ao processar o orçamento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const renderCategoryTable = (title: string, categoryKey: string, items: BudgetItem[]) => {
    const categoryItems = items.filter(i => i.category === categoryKey);
    if (categoryItems.length === 0) return null;

    const subtotal = categoryItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1 uppercase tracking-wide">{title}</h3>
        <table className="min-w-full divide-y divide-gray-200 mb-2">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Qtd</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Un</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Preço Un.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categoryItems.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                <td className="px-3 py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{item.unit}</td>
                <td className="px-3 py-2 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end bg-gray-100 p-2 rounded-b-md">
          <span className="text-sm font-bold text-gray-700 mr-4">Subtotal {title}:</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 print:bg-white print:overflow-visible">
      {/* Toolbar - Hidden on Print */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center z-50 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Orçamento Estimativo</h2>
            <p className="text-xs text-gray-500">Gerado por Inteligência Artificial</p>
          </div>
        </div>
        <div className="flex gap-3">
           {proposal && !isLoading && (
             <button
              onClick={handleGenerateBudget}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Regenerar
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
            disabled={isLoading || !proposal}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Imprimir Proposta
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-20 max-w-[210mm] mx-auto bg-white shadow-xl min-h-screen p-[20mm] print:shadow-none print:m-0 print:w-full">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">A calcular materiais e serviços...</p>
            <p className="text-sm text-gray-400 mt-2">Isto pode demorar alguns segundos.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg text-gray-900 font-medium">{error}</p>
            <button 
              onClick={handleGenerateBudget}
              className="mt-4 text-blue-600 hover:underline"
            >
              Tentar Novamente
            </button>
          </div>
        ) : proposal ? (
          <div className="animate-fadeIn">
             {/* Header Proposal */}
             <div className="border-b-2 border-emerald-600 pb-6 mb-8 flex justify-between items-start">
               <div>
                 <h1 className="text-3xl font-bold text-gray-900 mb-1">Proposta Orçamental</h1>
                 <p className="text-gray-500 text-sm">Implementação de Sistema GTC (BMS)</p>
               </div>
               <div className="text-right">
                 <p className="text-sm text-gray-500">Data</p>
                 <p className="font-medium text-gray-900">{new Date().toLocaleDateString('pt-PT')}</p>
               </div>
             </div>

             {renderCategoryTable('1. Hardware & Automação', 'HARDWARE', proposal.items)}
             {renderCategoryTable('2. Equipamento de Campo', 'FIELD_DEVICES', proposal.items)}
             {renderCategoryTable('3. Instalação Elétrica', 'ELECTRICAL', proposal.items)}
             {renderCategoryTable('4. Serviços de Engenharia', 'SERVICES', proposal.items)}

             {/* Total Summary */}
             <div className="mt-12 bg-gray-900 text-white p-6 rounded-lg break-inside-avoid">
               <div className="flex justify-between items-center">
                 <span className="text-xl font-light">TOTAL ESTIMADO</span>
                 <span className="text-3xl font-bold">{formatCurrency(proposal.total)}</span>
               </div>
               <p className="text-xs text-gray-400 mt-2 text-right">Valores sem IVA incluído.</p>
             </div>

             {/* Assumptions / Notes */}
             {proposal.assumptions && proposal.assumptions.length > 0 && (
               <div className="mt-8 border-t border-gray-200 pt-6 break-inside-avoid">
                 <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Considerações e Exclusões</h4>
                 <ul className="list-disc pl-5 space-y-1">
                   {proposal.assumptions.map((note, i) => (
                     <li key={i} className="text-sm text-gray-600">{note}</li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BudgetModal;