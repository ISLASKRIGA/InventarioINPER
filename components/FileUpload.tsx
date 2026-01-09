
import React, { useRef, useState } from 'react';
import { Upload, Loader2, Search } from 'lucide-react';
import { Medication } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: Medication[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseExcelDate = (val: any): string => {
    if (!val) return '2099-01-01';
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    const date = new Date(val);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '2099-01-01';
  };

  const normalize = (str: string) => 
    String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = (window as any).XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const rows: any[][] = (window as any).XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        let headerRowIndex = 0;
        const keywords = {
          clave: ['clave', 'codigo', 'id', 'sku', 'code', 'no', 'referencia', 'ref'],
          nombre: ['medicamento', 'nombre', 'producto', 'descripcion', 'item', 'medicine', 'articulo', 'denominacion', 'sustancia'],
          lote: ['lote', 'batch', 'numlote', 'serie', 'number', 'lot'],
          fecha: ['caducidad', 'vencimiento', 'fecha', 'expiry', 'expiration', 'vence', 'cad', 'venc'],
          cantidad: ['cantidad', 'stock', 'unidades', 'qty', 'count', 'monto', 'existencia', 'disponible', 'saldo', 'total']
        };

        let maxMatches = -1;
        for (let i = 0; i < Math.min(rows.length, 15); i++) {
          let matches = 0;
          const rowValues = rows[i].map(v => normalize(String(v)));
          
          Object.values(keywords).forEach(list => {
            if (list.some(k => rowValues.some(rv => rv.includes(k)))) matches++;
          });

          if (matches > maxMatches) {
            maxMatches = matches;
            headerRowIndex = i;
          }
          if (matches === 5) break; 
        }

        const headers = rows[headerRowIndex].map(h => normalize(String(h)));
        const colMap = {
          clave: headers.findIndex(h => keywords.clave.some(k => h.includes(k))),
          nombre: headers.findIndex(h => keywords.nombre.some(k => h.includes(k))),
          lote: headers.findIndex(h => keywords.lote.some(k => h.includes(k))),
          fecha: headers.findIndex(h => keywords.fecha.some(k => h.includes(k))),
          cantidad: headers.findIndex(h => keywords.cantidad.some(k => h.includes(k)))
        };

        const mappedData: Medication[] = [];
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const nombre = colMap.nombre !== -1 ? String(row[colMap.nombre] || '') : '';
          const clave = colMap.clave !== -1 ? String(row[colMap.clave] || '') : '';
          const lote = colMap.lote !== -1 ? String(row[colMap.lote] || '') : 'N/A';
          
          if (!nombre && !clave) continue;

          // CORRECCIÓN: Usamos Math.round para eliminar los decimales basura de Excel (ej: 624.0000000001 -> 624)
          const rawCantidad = colMap.cantidad !== -1 ? Number(row[colMap.cantidad]) : 0;
          const cantidadLimpia = Math.round(rawCantidad || 0);

          mappedData.push({
            id: `med-${i}-${Date.now()}`,
            clave: clave || 'N/A',
            nombre: nombre || 'Sin nombre',
            lote: lote || 'N/A',
            fechaCaducidad: colMap.fecha !== -1 ? parseExcelDate(row[colMap.fecha]) : '2099-01-01',
            cantidad: cantidadLimpia
          });
        }

        if (mappedData.length === 0) {
          alert("No pudimos reconocer las columnas. Asegúrate de que tu Excel tenga encabezados como 'Nombre', 'Cantidad', 'Lote' y 'Clave'.");
        } else {
          onDataLoaded(mappedData);
        }
      } catch (err) {
        console.error(err);
        alert("Error al procesar el archivo.");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className={`w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all ${
          isProcessing ? 'bg-slate-800 text-slate-400' : 'bg-white hover:bg-gray-50 text-slate-900 active:scale-95'
        }`}
      >
        {isProcessing ? <Loader2 size={20} className="animate-spin text-blue-400" /> : <Upload size={20} className="text-blue-600" />}
        <span>{isProcessing ? 'Procesando...' : 'Importar Excel'}</span>
      </button>
      
      <div className="mt-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm">
        <h5 className="text-[10px] font-black text-blue-400 mb-3 uppercase tracking-widest flex items-center gap-2">
          <Search size={12} /> Auto-Detección Activada
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <Badge label="Clave / ID" />
          <Badge label="Nombre / Art." />
          <Badge label="Lote / Batch" />
          <Badge label="Stock / Cant." />
          <Badge label="Venc. / Cad." />
        </div>
      </div>
    </div>
  );
};

const Badge = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-slate-700/50 px-2 py-1 rounded-md border border-slate-600/30">
    <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
    {label}
  </div>
);

export default FileUpload;
