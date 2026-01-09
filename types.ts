
export interface Medication {
  id: string;
  clave: string;
  nombre: string;
  lote: string;
  fechaCaducidad: string;
  cantidad: number;
}

export interface InventoryStats {
  totalMedicamentos: number;
  totalUnidades: number;
  porVencer: number; // Próximos 3 meses
  vencidos: number;
}

export enum ExpiryStatus {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED'
}
