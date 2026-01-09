
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
    .slice(0, 5);

  const expiryData = [
    { name: 'Vencidos', value: stats.vencidos, color: '#ef4444', type: 'expired' },
    { name: 'Próximos (3m)', value: stats.porVencer, color: '#f59e0b', type: 'upcoming' },
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
      title = "Reporte de Medicamentos Vencidos";
    } else if (type === 'upcoming') {
      filtered = medications.filter(m => {
        const d = new Date(m.fechaCaducidad);
        return d >= today && d <= threeMonths;
      });
      title = "Reporte de Próximos Vencimientos";
    }

    generateMedicationReport(title, filtered, stats);
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Medicamentos" 
          value={stats.totalMedicamentos} 
          icon={<Package className="text-blue-600" />} 
          trend="Ver inventario completo"
          color="blue"
          onClick={() => onStatClick('all')}
          onDownload={(e: any) => downloadSpecificReport(e, 'all')}
        />
        <StatCard 
          title="Stock Total" 
          value={stats.totalUnidades} 
          icon={<TrendingUp className="text-emerald-600" />} 
          trend="Unidades totales"
          color="emerald"
          onClick={() => onStatClick('all')}
          onDownload={(e: any) => downloadSpecificReport(e, 'all')}
        />
        <StatCard 
          title="Próximos a Vencer" 
          value={stats.porVencer} 
          icon={<AlertTriangle className="text-amber-500" />} 
          trend="Ver próximos 90 días"
          color="amber"
          onClick={() => onStatClick('upcoming')}
          onDownload={(e: any) => downloadSpecificReport(e, 'upcoming')}
        />
        <StatCard 
          title="Vencidos" 
          value={stats.vencidos} 
          icon={<CalendarOff className="text-red-600" />} 
          trend="Ver para retiro"
          color="red"
          onClick={() => onStatClick('expired')}
          onDownload={(e: any) => downloadSpecificReport(e, 'expired')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top 5 Stock por Cantidad</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMedicationsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="nombre" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Estado de Caducidad</h3>
            <button 
              onClick={(e) => downloadSpecificReport(e, 'all')}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Download size={14} /> PDF Global
            </button>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expiryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data: any) => onStatClick(data.type)}
                  style={{ cursor: 'pointer' }}
                >
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 ml-4">
               {expiryData.map((item, idx) => (
                 <div 
                   key={idx} 
                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                   onClick={() => onStatClick(item.type as any)}
                 >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600 font-medium">{item.name}: {item.value}</span>
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
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl transition-colors ${colorClasses[color]} group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-gray-900">{value}</span>
          <button 
            onClick={onDownload}
            className="mt-1 p-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-400 rounded-lg transition-all"
            title="Descargar PDF de esta categoría"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
        <p className="text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
          {trend} &rarr;
        </p>
        <p className="text-xs text-gray-400 font-medium group-hover:hidden">{trend}</p>
      </div>
    </div>
  );
};

export default Dashboard;