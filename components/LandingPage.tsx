
import React from 'react';
import { Cpu, ArrowRight, Database, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
              <Cpu className="w-20 h-20 text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
            K-SIMSACE
          </h1>
          <p className="text-lg font-light text-blue-200/80 mb-8 tracking-widest">
            SMART INTEGRATION & MANAGEMENT SYSTEM
          </p>

          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Geração automática de pontos de GTC, orçamentação e validação normativa EN15232 assistida por Inteligência Artificial.
          </p>

          <button 
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]"
          >
            <span className="relative z-10">Iniciar Aplicação</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Database className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Gestão de Pontos</h3>
              <p className="text-sm text-gray-400">Geração de listas de I/O detalhadas com sugestão automática de sinais.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Norma EN15232</h3>
              <p className="text-sm text-gray-400">Verificação de classe de eficiência energética e emissão de certificado.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Zap className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Orçamentação IA</h3>
              <p className="text-sm text-gray-400">Estimativa imediata de hardware, cablagem e serviços de engenharia.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 px-8 flex justify-between items-end text-xs text-gray-500 border-t border-white/5 bg-black/20">
        <div>
          <p className="font-mono">Versão 1.0</p>
          <p>{new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long' })}</p>
        </div>
        <div className="text-right">
          <p>Developed by</p>
          <p className="font-bold text-blue-400 text-sm">Koelho2000</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
