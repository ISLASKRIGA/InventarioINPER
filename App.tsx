
import React, { useState, useMemo, useEffect } from 'react';
import { Medication, InventoryStats } from './types';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import FileUpload from './components/FileUpload';
import GeminiInsights from './components/GeminiInsights';
import DatabaseSetupGuide from './components/DatabaseSetupGuide';
import { supabaseService } from './services/supabaseService';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  FileUp, 
  Sparkles, 
  Trash2, 
  AlertCircle, 
  ShieldCheck,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Database,
  DatabaseZap,
  Menu,
  X
} from 'lucide-react';

export type FilterType = 'all' | 'upcoming' | 'expired';

const LOCAL_STORAGE_KEY = 'medstats_pro_inventory';
const DELETE_PASSWORD = "farmaciahospitalaria";

const App: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    try {
      return savedData ? JSON.parse(savedData) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'ai' | 'setup'>('dashboard');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isTableMissing = errorMessage?.includes('Could not find the table') || errorMessage?.includes('404');

  const fetchInitialData = async () => {
    setSyncStatus('syncing');
    setErrorMessage(null);
    const { data, error } = await supabaseService.getMedications();
    
    if (error) {
      setSyncStatus('error');
      setErrorMessage(error);
      if (error.includes('Could not find the table')) {
        setActiveTab('setup');
      }
    } else {
      setMedications(data);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setSyncStatus('success');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (syncStatus !== 'syncing') fetchInitialData();
    }, 300000); 
    return () => clearInterval(interval);
  }, [syncStatus]);

  const stats = useMemo((): InventoryStats => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    return medications.reduce((acc, med) => {
      const expiry = new Date(med.fechaCaducidad);
      acc.totalUnidades += med.cantidad;
      
      if (expiry < today) {
        acc.vencidos += 1;
      } else if (expiry <= threeMonthsFromNow) {
        acc.porVencer += 1;
      }
      
      return acc;
    }, {
      totalMedicamentos: medications.length,
      totalUnidades: 0,
      porVencer: 0,
      vencidos: 0
    });
  }, [medications]);

  const handleDataImport = async (newData: Medication[]) => {
    setSyncStatus('syncing');
    try {
      await supabaseService.upsertMedications(newData);
      const { data } = await supabaseService.getMedications();
      setMedications(data);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setSyncStatus('success');
      setFilterType('all');
      setIsMobileMenuOpen(false);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || 'Error al importar');
    }
  };

  const handleStatClick = (type: FilterType) => {
    setFilterType(type);
    setActiveTab('table');
  };

  const executeClearData = async () => {
    if (deleteInput === DELETE_PASSWORD) {
      setSyncStatus('syncing');
      try {
        await supabaseService.deleteAllMedications();
        setMedications([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setFilterType('all');
        setActiveTab('dashboard');
        setIsConfirmingDelete(false);
        setDeleteInput('');
        setSyncStatus('success');
        setIsMobileMenuOpen(false);
      } catch (err: any) {
        setSyncStatus('error');
        alert("Error al borrar: " + err.message);
      }
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FarmaINPER</h1>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus === 'syncing' && <RefreshCw size={14} className="animate-spin text-blue-400" />}
          {syncStatus === 'success' && <CloudCheck size={14} className="text-emerald-400" />}
          {syncStatus === 'error' && <CloudOff size={14} className="text-red-400" />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <nav className="space-y-2 mb-8">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Menú Principal</p>
          <button
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Panel General</span>
          </button>
          <button
            onClick={() => { setActiveTab('table'); setFilterType('all'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'table' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
          >
            <TableIcon size={20} />
            <span className="font-medium text-sm">Inventario</span>
          </button>
          <button
            onClick={() => { setActiveTab('ai'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
          >
            <Sparkles size={20} />
            <span className="font-medium text-sm">Análisis IA</span>
          </button>
          
          {isTableMissing && (
            <button
              onClick={() => { setActiveTab('setup'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'setup' ? 'bg-amber-600 shadow-lg shadow-amber-900/20' : 'text-amber-400 hover:bg-slate-800'}`}
            >
              <Database size={20} />
              <span className="font-medium text-sm">Configurar DB</span>
            </button>
          )}
        </nav>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">Carga de Datos</p>
          <FileUpload onDataLoaded={handleDataImport} />
        </div>
      </div>

      <div className="pt-4 mt-6 border-t border-slate-800 shrink-0">
        {!isConfirmingDelete ? (
          <button
            onClick={() => setIsConfirmingDelete(true)}
            disabled={medications.length === 0}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
          >
            <Trash2 size={20} />
            <span className="text-sm font-bold">Borrar Todo</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-3 bg-red-950/20 rounded-xl border border-red-900/30">
            <input 
              type="password"
              placeholder="Clave..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeClearData()}
            />
            <div className="flex gap-2">
              <button onClick={executeClearData} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase">Confirmar</button>
              <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 py-2 text-[10px] text-gray-500 uppercase font-bold">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-slate-900 overflow-x-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold tracking-tight">FarmaINPER</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-white p-6 flex-col h-screen sticky top-0 z-20">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-4/5 h-full bg-slate-900 p-6 flex flex-col animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Panel de Control'}
              {activeTab === 'table' && 'Inventario'}
              {activeTab === 'ai' && 'Análisis Predictivo'}
              {activeTab === 'setup' && 'Configuración DB'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-gray-500 text-[10px] md:text-sm italic">FarmaINPER v1.4</span>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border border-blue-100">
                <DatabaseZap size={10} /> {medications.length} Registros
              </span>
            </div>
          </div>
          
          <button 
            onClick={fetchInitialData}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 border border-gray-200 rounded-xl shadow-sm hover:text-blue-600 transition-all font-bold text-sm"
          >
            <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
        </header>

        <div className="space-y-6">
          {activeTab === 'setup' && <DatabaseSetupGuide onRetry={fetchInitialData} />}
          
          {activeTab !== 'setup' && (
            <>
              {medications.length === 0 && activeTab !== 'ai' ? (
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center">
                  <FileUp size={48} className="text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800">No hay datos</h3>
                  <p className="text-gray-500 text-sm max-w-xs mt-2">Sube un Excel para comenzar.</p>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <Dashboard stats={stats} medications={medications} onStatClick={handleStatClick} />
                  )}
                  {activeTab === 'table' && (
                    <InventoryTable medications={medications} initialFilter={filterType} onFilterChange={setFilterType} />
                  )}
                  {activeTab === 'ai' && <GeminiInsights medications={medications} />}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
