
import { createClient } from '@supabase/supabase-js';
import { Medication } from '../types';

const SUPABASE_URL = 'https://kzzzvwzqrdjgjvcpwuvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VvjZIsrc9PCoF2I-tw4ILg_-1T1Ug19';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SQL_SETUP_SCRIPT = `
-- Ejecuta esto en el SQL Editor de Supabase
create table medications (
  id text primary key,
  clave text,
  nombre text,
  lote text,
  fecha_caducidad text,
  cantidad numeric
);

alter table medications enable row level security;
create policy "Permitir todo a usuarios anon" on medications for all using (true) with check (true);
`.trim();

export const supabaseService = {
  /**
   * Obtiene todos los medicamentos sin importar los límites del servidor.
   * Retorna los datos y el conteo total para asegurar transparencia en el Dashboard.
   */
  async getMedications(): Promise<{ data: Medication[], error?: string, totalCount?: number }> {
    try {
      // 1. Obtener el conteo total exacto de la base de datos (muy rápido)
      const { count, error: countError } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      // 2. Cargar todos los datos por páginas (esto soluciona el límite de 1000 de Supabase)
      while (hasMore) {
        const { data, error } = await supabase
          .from('medications')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('nombre', { ascending: true });
        
        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          page++;
          // Si trajo menos de lo pedido, ya terminamos
          if (data.length < pageSize) hasMore = false;
        } else {
          hasMore = false;
        }
        
        // Límite de seguridad para evitar bucles infinitos
        if (page > 100) break; 
      }

      const mapped = allData.map(item => ({
        id: item.id,
        clave: item.clave,
        nombre: item.nombre,
        lote: item.lote,
        fechaCaducidad: item.fecha_caducidad,
        cantidad: Number(item.cantidad) || 0
      }));

      return { 
        data: mapped, 
        totalCount: count || mapped.length 
      };
    } catch (err: any) {
      return { data: [], error: err.message || 'Error de conexión' };
    }
  },

  async upsertMedications(meds: Medication[]) {
    const payload = meds.map(m => ({
      id: m.id,
      clave: m.clave,
      nombre: m.nombre,
      lote: m.lote,
      fecha_caducidad: m.fechaCaducidad,
      cantidad: Math.round(m.cantidad)
    }));

    // Insertar en bloques de 500 para mayor estabilidad
    const chunkSize = 500;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('medications')
        .upsert(chunk, { onConflict: 'id' });
      
      if (error) throw error;
    }
  },

  async deleteAllMedications() {
    const { error } = await supabase
      .from('medications')
      .delete()
      .neq('id', '0'); 

    if (error) throw error;
  }
};
