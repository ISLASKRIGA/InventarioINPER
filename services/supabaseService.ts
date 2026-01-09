
import { createClient } from '@supabase/supabase-js';
import { Medication } from '../types';

const SUPABASE_URL = 'https://kzzzvwzqrdjgjvcpwuvl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VvjZIsrc9PCoF2I-tw4ILg_-1T1Ug19';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SQL_SETUP_SCRIPT = `
-- Ejecuta este código en el SQL Editor de tu Dashboard de Supabase
create table medications (
  id text primary key,
  clave text,
  nombre text,
  lote text,
  fecha_caducidad text,
  cantidad integer
);

-- Habilitar acceso público (opcional, ajusta según tu seguridad)
alter table medications enable row level security;
create policy "Permitir todo a usuarios anon" on medications for all using (true) with check (true);
`.trim();

export const supabaseService = {
  async getMedications(): Promise<{ data: Medication[], error?: string }> {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*');
      
      if (error) {
        return { data: [], error: error.message };
      }

      const mapped = (data || []).map(item => ({
        id: item.id,
        clave: item.clave,
        nombre: item.nombre,
        lote: item.lote,
        fechaCaducidad: item.fecha_caducidad,
        cantidad: item.cantidad
      }));

      return { data: mapped };
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
      cantidad: m.cantidad
    }));

    const { error } = await supabase
      .from('medications')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteAllMedications() {
    const { error } = await supabase
      .from('medications')
      .delete()
      .neq('id', '0'); 

    if (error) throw error;
  }
};
