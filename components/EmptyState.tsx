import React from 'react';
import { Database, ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  onAddFirst: () => void;
  hasItems: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddFirst, hasItems }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestor de Pontos GTC
        </h2>
        <p className="text-gray-500 mb-8">
          Selecione um equipamento na barra lateral para ver e editar os seus pontos técnicos, ou crie um novo equipamento utilizando a Inteligência Artificial para gerar a lista de sinais automaticamente.
        </p>
        
        {!hasItems && (
          <button
            onClick={onAddFirst}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Criar Novo Equipamento
          </button>
        )}
        
        {hasItems && (
          <div className="flex items-center justify-center text-gray-400 text-sm gap-2 animate-pulse">
            <ArrowLeft className="w-4 h-4" />
            <span>Selecione um item à esquerda</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;