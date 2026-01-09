
import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { SQL_SETUP_SCRIPT } from '../services/supabaseService';

interface DatabaseSetupGuideProps {
  onRetry: () => void;
}

const DatabaseSetupGuide: React.FC<DatabaseSetupGuideProps> = ({ onRetry }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
        {/* Banner de Advertencia */}
        <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-800">Tabla 'medications' no encontrada</h3>
            <p className="text-amber-700 mt-1 font-medium">
              Tu proyecto de Supabase está conectado, pero falta la tabla necesaria para guardar los datos.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step 
              number="1" 
              title="Abre Supabase" 
              desc="Ve a tu Dashboard y entra en 'SQL Editor'." 
              icon={<ExternalLink size={18} />}
              link="https://supabase.com/dashboard/project/kzzzvwzqrdjgjvcpwuvl/sql/new"
            />
            <Step 
              number="2" 
              title="Pega el Código" 
              desc="Copia el script de abajo y pégalo en el editor." 
              icon={<Copy size={18} />}
            />
            <Step 
              number="3" 
              title="Ejecuta 'Run'" 
              desc="Presiona el botón 'Run' para crear la tabla." 
              icon={<Database size={18} />}
            />
          </div>

          {/* Código SQL */}
          <div className="relative group">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '¡Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 pt-14 font-mono text-sm text-blue-300 overflow-x-auto border-4 border-slate-800 shadow-inner max-h-[300px]">
              <pre>{SQL_SETUP_SCRIPT}</pre>
            </div>
          </div>

          {/* Acción Final */}
          <div className="flex flex-col items-center justify-center pt-4">
            <p className="text-slate-500 text-sm mb-4 font-medium">Una vez ejecutado el SQL, haz clic aquí:</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              <RefreshCw size={24} />
              Verificar Conexión Ahora
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-xs font-medium">
        <p>¿No quieres configurar Supabase? Puedes seguir usando la app, pero los datos solo se guardarán en este navegador.</p>
      </div>
    </div>
  );
};

const Step = ({ number, title, desc, icon, link }: any) => (
  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
    <div className="w-10 h-10 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center font-black text-sm mb-3">
      {number}
    </div>
    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
      {title} {icon}
    </h4>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    {link && (
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline"
      >
        Ir al Dashboard &rarr;
      </a>
    )}
  </div>
);

export default DatabaseSetupGuide;
