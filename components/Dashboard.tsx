
import React from 'react';
import { Medication, InventoryStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Package, CalendarOff, Download } from 'lucide-react';
import { generateMedicationReport } from '../services/reportService';

interface DashboardProps {
  stats: InventoryStats;
  medications: Medication[];
  onStatClick: (type: 'all' | 'upcoming' | 'expired') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, medications, onStatClick }) => {
  const topMedicationsData = [...medications]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
    .map(m => ({ 
      ...m, 
      shortName: m.nombre.length > 10 ? m.nombre.substring(0, 10) + '...' : m.nombre 
    }));

  const expiryData = [
    { name: 'Vencidos', value: stats.vencidos, color: '#ef4444', type: 'expired' },
    { name: 'Próximos', value: stats.porVencer, color: '#f59e0b', type: 'upcoming' },
    { name: 'Vigentes', value: Math.max(0, stats.totalMedicamentos - stats.vencidos - stats.porVencer), color: '#10b981', type: 'all' },
  ];

  const downloadSpecificReport = (e: React.MouseEvent, type: 'all' | 'upcoming' | 'expired') => {
    e.stopPropagation();
    const today = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(today.getMonth() + 3);

    let filtered = medications;
    let title = "Inventario General";

    if (type === 'expired') {
      filtered = medications.filter(m => new Date(m.fechaCaducidad) < today);
      title = "Reporte Vencidos";
    } else if (type === 'upcoming') {
      filtered = medications.filter(m => {
        const d = new Date(m.fechaCaducidad);
        return d >= today && d <= threeMonths;
      });
      title = "Reporte Próximos Vencimientos";
    }

    generateMedicationReport(title, filtered, stats);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stat Cards - Grid Adaptativo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          title="Total Meds" 
          value={stats.totalMedicamentos} 
          icon={<Package size={18} className="text-blue-600" />} 
          trend="Inventario"
          color="blue"
          onClick={() => onStatClick('all')}
          onDownload={(e: any) => downloadSpecificReport(e, 'all')}
        />
        <StatCard 
          title="Stock" 
          value={stats.totalUnidades} 
          icon={<TrendingUp size={18} className="text-emerald-600" />} 
          trend="Unidades"
          color="emerald"
          onClick={() => onStatClick('all')}
          onDownload={(e: any) => downloadSpecificReport(e, 'all')}
        />
        <StatCard 
          title="Próximos" 
          value={stats.porVencer} 
          icon={<AlertTriangle size={18} className="text-amber-500" />} 
          trend="90 días"
          color="amber"
          onClick={() => onStatClick('upcoming')}
          onDownload={(e: any) => downloadSpecificReport(e, 'upcoming')}
        />
        <StatCard 
          title="Vencidos" 
          value={stats.vencidos} 
          icon={<CalendarOff size={18} className="text-red-600" />} 
          trend="Retirar"
          color="red"
          onClick={() => onStatClick('expired')}
          onDownload={(e: any) => downloadSpecificReport(e, 'expired')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Top Stock</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMedicationsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="shortName" axisLine={false} tickLine={false} fontSize={9} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800">Estado</h3>
            <button onClick={(e) => downloadSpecificReport(e, 'all')} className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
              <Download size={12} /> PDF
            </button>
          </div>
          <div className="h-64 md:h-80 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expiryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(data: any) => onStatClick(data.type)} style={{ cursor: 'pointer' }}>
                  {expiryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 w-full mt-4">
               {expiryData.map((item, idx) => (
                 <div key={idx} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onStatClick(item.type as any)}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">{item.name}</span>
                    <span className="text-xs font-black text-gray-800">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color, onClick, onDownload }: any) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer relative group"
    >
      <div className="flex justify-between items-start mb-2 md:mb-3">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>{icon}</div>
        <button onClick={onDownload} className="p-1 hover:text-blue-600 text-gray-300 transition-colors"><Download size={14} /></button>
      </div>
      <div>
        <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{value}</div>
        <h4 className="text-[9px] md:text-xs font-bold text-gray-400 uppercase mt-1 tracking-wider">{title}</h4>
      </div>
    </div>
  );
};

export default Dashboard;
