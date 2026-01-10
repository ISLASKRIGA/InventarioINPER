
import React, { useState, useMemo } from 'react';
import { Medication } from '../types';
import { Search, AlertCircle, CheckCircle2, Clock, X, Hash, Package } from 'lucide-react';

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
      if (initialFilter === 'expired') return expiry < today;
      if (initialFilter === 'upcoming') return expiry >= today && expiry <= threeMonthsFromNow;
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
        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-red-100">
          <AlertCircle size={10} /> Vencido
        </span>
      );
    }
    if (date <= threeMonths) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-amber-100">
          <Clock size={10} /> Próximo
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
        <CheckCircle2 size={10} /> Vigente
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar medicamento..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {initialFilter !== 'all' && (
              <div className={`flex items-center self-start gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                initialFilter === 'expired' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                <span>{initialFilter === 'expired' ? 'Vencidos' : 'Cerca de vencer'}</span>
                <button onClick={() => onFilterChange?.('all')} className="p-0.5 hover:bg-black/5 rounded-full"><X size={12} /></button>
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
            Mostrando <span className="text-blue-600">{filteredMeds.length}</span> resultados
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-100">
                <th className="px-6 py-4">Clave</th>
                <th className="px-6 py-4">Medicamento</th>
                <th className="px-6 py-4">Lote</th>
                <th className="px-6 py-4">Caducidad</th>
                <th className="px-6 py-4 text-center">Cant.</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMeds.map((med) => (
                <tr key={med.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{med.clave}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{med.nombre}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit">
                      <Hash size={10} /> {med.lote}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {new Date(med.fechaCaducidad).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-slate-800">{med.cantidad}</span>
                  </td>
                  <td className="px-6 py-4 text-right">{getStatusBadge(med.fechaCaducidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredMeds.map((med) => (
            <div key={med.id} className="p-4 bg-white active:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{med.clave}</span>
                {getStatusBadge(med.fechaCaducidad)}
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-3 leading-snug">{med.nombre}</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-gray-400 font-bold uppercase">Lote</span>
                  <span className="text-[10px] font-bold text-slate-600 truncate">{med.lote}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-gray-400 font-bold uppercase">Caducidad</span>
                  <span className="text-[10px] font-bold text-slate-600">{new Date(med.fechaCaducidad).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[8px] text-gray-400 font-bold uppercase">Stock</span>
                  <div className="flex items-center gap-1">
                    <Package size={10} className="text-blue-500" />
                    <span className="text-sm font-black text-blue-700">{med.cantidad}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMeds.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <Search size={32} className="text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm font-medium italic">Sin resultados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
