
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Medication, InventoryStats } from '../types';

export const generateMedicationReport = (
  title: string, 
  data: Medication[], 
  stats?: InventoryStats
) => {
  const doc = new jsPDF() as any;
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Header - FarmaINPER Branding
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FarmaINPER', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión de Inventario Hospitalario', 15, 28);
  doc.text(`Generado el: ${today}`, 140, 28);

  // Report Title
  doc.setTextColor(31, 41, 55); // Gray 800
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 15, 55);

  // Summary Stats if provided
  if (stats) {
    doc.setFontSize(10);
    doc.text('RESUMEN EJECUTIVO:', 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Medicamentos: ${stats.totalMedicamentos}`, 15, 72);
    doc.text(`Stock Total Unidades: ${stats.totalUnidades}`, 15, 78);
    doc.text(`Próximos a Vencer (90 días): ${stats.porVencer}`, 100, 72);
    doc.text(`Vencidos: ${stats.vencidos}`, 100, 78);
  }

  // Table
  const tableRows = data.map(m => [
    m.clave,
    m.nombre,
    m.lote,
    m.fechaCaducidad,
    m.cantidad
  ]);

  doc.autoTable({
    startY: stats ? 85 : 65,
    head: [['CLAVE', 'MEDICAMENTO', 'LOTE', 'CADUCIDAD', 'CANTIDAD']],
    body: tableRows,
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    margin: { top: 20 },
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `FarmaINPER - Reporte de Control de Inventario - Página ${i} de ${pageCount}`,
      15,
      285
    );
  }

  doc.save(`FarmaINPER_Reporte_${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};

export const generateAIInsightReport = (analysisText: string) => {
  const doc = new jsPDF() as any;
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Header
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FarmaINPER - IA Insights', 15, 20);
  
  doc.setFontSize(10);
  doc.text(`Análisis Estratégico generado por Gemini AI - ${today}`, 15, 28);

  // Content
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESULTADOS DEL ANÁLISIS DE INVENTARIO', 15, 55);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Handling long text with splitTextToSize
  const splitText = doc.splitTextToSize(analysisText, 180);
  doc.text(splitText, 15, 65);

  // Disclaimer
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 230;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, 250, 195, 250);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 114, 128);
  doc.text(
    'AVISO LEGAL: Este informe ha sido generado mediante inteligencia artificial para apoyo administrativo.',
    15, 258
  );
  doc.text(
    'Las decisiones críticas de salud y suministro deben ser validadas por personal farmacéutico cualificado.',
    15, 263
  );

  doc.save(`FarmaINPER_IA_Analisis_${new Date().getTime()}.pdf`);
};
