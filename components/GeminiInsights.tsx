
import React, { useState } from 'react';
import { Medication } from '../types';
import { analyzeInventory } from '../services/geminiService';
import { generateAIInsightReport } from '../services/reportService';
import { Sparkles, Loader2, BrainCircuit, RefreshCw, Download } from 'lucide-react';

interface GeminiInsightsProps {
  medications: Medication[];
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ medications }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeInventory(medications);
    setAnalysis(result || "No se pudo obtener el análisis.");
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (analysis) {
      generateAIInsightReport(analysis);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BrainCircuit size={32} className="text-blue-200" />
          <h3 className="text-2xl font-black italic">Gemini AI Analysis</h3>
        </div>
        <p className="text-blue-100 max-w-xl text-lg">
          Utiliza la inteligencia artificial de Google para analizar tendencias en tu inventario, detectar riesgos de caducidad y optimizar tu stock.
        </p>
        
        {!analysis && !loading && (
          <button
            onClick={handleAnalyze}
            disabled={medications.length === 0}
            className="mt-8 flex items-center gap-3 bg-white text-blue-700 font-black py-4 px-8 rounded-2xl shadow-xl hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            <Sparkles size={24} />
            Generar Informe Inteligente
          </button>
        )}
      </div>

      <div className="flex-1 p-8 bg-slate-50 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10">
            <Loader2 size={48} className="animate-spin text-blue-600" />
            <p className="text-blue-800 font-bold animate-pulse">Analizando inventario médico...</p>
          </div>
        ) : analysis ? (
          <div className="prose prose-slate max-w-none">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Resultados del Análisis
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-blue-600 font-bold text-xs hover:shadow-md transition-all"
                  title="Descargar análisis en PDF"
                >
                  <Download size={16} /> Descargar PDF
                </button>
                <button 
                  onClick={handleAnalyze}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                  title="Actualizar análisis"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-inner border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base">
              {analysis}
            </div>
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Sparkles className="text-blue-600 shrink-0 mt-1" size={20} />
              <p className="text-xs text-blue-800 font-semibold italic">
                * Este análisis es generado por IA y debe ser verificado por personal calificado antes de tomar decisiones críticas de suministro.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Sparkles size={64} className="mb-4 opacity-20" />
            <p className="text-center italic font-medium">Haz clic en el botón superior para procesar los datos actuales.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiInsights;