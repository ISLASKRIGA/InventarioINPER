
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
  Database
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
      if (data.length > 0) {
        setMedications(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
      setSyncStatus('success');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(medications));
  }, [medications]);

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
      const updatedMeds = [...medications, ...newData];
      setMedications(updatedMeds);
      await supabaseService.upsertMedications(newData);
      setSyncStatus('success');
      // Se eliminó setActiveTab('table') para permanecer en la pestaña actual
      setFilterType('all');
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || 'Error al importar');
      alert("Guardado localmente. Error en la nube: " + (err.message || 'Error desconocido'));
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
      } catch (err: any) {
        setSyncStatus('error');
        alert("Error al borrar en la nube: " + err.message);
      }
    } else {
      alert("La clave ingresada es incorrecta.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-6 flex flex-col h-screen sticky top-0 z-20">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FarmaINPER</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {syncStatus === 'syncing' && <RefreshCw size={14} className="animate-spin text-blue-400" />}
            {syncStatus === 'success' && <CloudCheck size={14} className="text-emerald-400" title="Sincronizado" />}
            {syncStatus === 'error' && <CloudOff size={14} className="text-red-400" title={errorMessage || "Error"} />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <nav className="space-y-2 mb-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Menú Principal</p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium text-sm">Panel General</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('table');
                setFilterType('all');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'table' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
            >
              <TableIcon size={20} />
              <span className="font-medium text-sm">Inventario</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
            >
              <Sparkles size={20} />
              <span className="font-medium text-sm">Análisis IA</span>
            </button>
            
            {isTableMissing && (
              <button
                onClick={() => setActiveTab('setup')}
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Trash2 size={20} />
              <span className="text-sm font-bold">Borrar Todo</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-3 bg-red-950/20 rounded-xl border border-red-900/30 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-wider">Seguridad</span>
              </div>
              <input 
                type="password"
                placeholder="Clave de borrado..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-red-500 outline-none"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && executeClearData()}
              />
              <button
                onClick={executeClearData}
                disabled={deleteInput !== DELETE_PASSWORD}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-900/40 disabled:opacity-50"
              >
                <AlertCircle size={14} />
                Confirmar
              </button>
              <button
                onClick={() => {
                    setIsConfirmingDelete(false);
                    setDeleteInput('');
                }}
                className="w-full py-1 text-[9px] text-gray-500 hover:text-white uppercase font-bold tracking-widest"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Panel de Control'}
              {activeTab === 'table' && 'Inventario de Medicamentos'}
              {activeTab === 'ai' && 'Análisis Predictivo'}
              {activeTab === 'setup' && 'Configuración de Base de Datos'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {syncStatus === 'error' && isTableMissing ? (
                <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <AlertCircle size={10} /> Requiere configuración en Supabase
                </span>
              ) : (
                <p className="text-gray-500 text-sm italic">FarmaINPER v1.2</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={fetchInitialData}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Sincronizar ahora"
          >
            <RefreshCw size={20} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="space-y-6">
          {activeTab === 'setup' && <DatabaseSetupGuide onRetry={fetchInitialData} />}
          
          {activeTab !== 'setup' && (
            <>
              {medications.length === 0 && activeTab !== 'ai' ? (
                <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <FileUp size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay medicamentos</h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Sube un archivo Excel para comenzar la gestión de inventario.
                  </p>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <Dashboard 
                      stats={stats} 
                      medications={medications} 
                      onStatClick={handleStatClick} 
                    />
                  )}
                  {activeTab === 'table' && (
                    <InventoryTable 
                      medications={medications} 
                      initialFilter={filterType} 
                      onFilterChange={setFilterType}
                    />
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
