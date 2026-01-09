
import React, { useState, useMemo } from 'react';
import { Medication } from '../types';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, X, Hash } from 'lucide-react';

interface InventoryTableProps {
  medications: Medication[];
  initialFilter?: 'all' | 'upcoming' | 'expired';
  onFilterChange?: (filter: 'all' | 'upcoming' | 'expired') => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ medications, initialFilter = 'all', onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMeds = useMemo(() => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    return medications.filter(med => {
      const matchesSearch = med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            med.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            med.lote.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      const expiry = new Date(med.fechaCaducidad);
      if (initialFilter === 'expired') {
        return expiry < today;
      }
      if (initialFilter === 'upcoming') {
        return expiry >= today && expiry <= threeMonthsFromNow;
      }
      
      return true;
    });
  }, [medications, searchTerm, initialFilter]);

  const getStatusBadge = (expiry: string) => {
    const today = new Date();
    const date = new Date(expiry);
    const threeMonths = new Date();
    threeMonths.setMonth(today.getMonth() + 3);

    if (date < today) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-100">
          <AlertCircle size={12} /> Vencido
        </span>
      );
    }
    if (date <= threeMonths) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-100">
          <Clock size={12} /> Próximo
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
        <CheckCircle2 size={12} /> Vigente
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, clave o lote..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {initialFilter !== 'all' && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border animate-in fade-in slide-in-from-left-2 duration-300 ${
              initialFilter === 'expired' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              <span>Filtrado: {initialFilter === 'expired' ? 'Vencidos' : 'Próximos a Vencer'}</span>
              <button 
                onClick={() => onFilterChange?.('all')}
                className="p-0.5 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
           <span>Mostrando <span className="text-blue-600 font-bold">{filteredMeds.length}</span></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-[11px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-100">
              <th className="px-6 py-5">Clave / ID</th>
              <th className="px-6 py-5">Nombre del Medicamento</th>
              <th className="px-6 py-5">Lote</th>
              <th className="px-6 py-5">Fecha Caducidad</th>
              <th className="px-6 py-5 text-center">Cantidad</th>
              <th className="px-6 py-5 text-right">Estado Operativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredMeds.map((med) => (
              <tr key={med.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-[11px] text-gray-500 bg-gray-50/20 group-hover:bg-transparent transition-colors">
                  {med.clave}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {med.nombre}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                    <Hash size={12} className="text-slate-400" />
                    {med.lote}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(med.fechaCaducidad).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{med.fechaCaducidad}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-black text-slate-800">
                    {med.cantidad}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    {getStatusBadge(med.fechaCaducidad)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredMeds.length === 0 && (
        <div className="p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Search size={32} className="text-gray-200" />
          </div>
          <h4 className="text-gray-800 font-bold">No se encontraron resultados</h4>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
