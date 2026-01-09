
import { GoogleGenAI, Type } from "@google/genai";
import { Medication } from "../types";

export const analyzeInventory = async (data: Medication[]) => {
  if (!process.env.API_KEY) return "Configura tu API Key para obtener insights.";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const inventorySummary = data.map(m => 
    `- ${m.nombre} (Lote: ${m.lote}, Clave: ${m.clave}): Qty ${m.cantidad}, Vence: ${m.fechaCaducidad}`
  ).join('\n');

  const prompt = `Analiza este inventario de medicamentos y proporciona 3 recomendaciones clave:
  1. Identifica riesgos críticos (vencimientos próximos por lote).
  2. Sugiere optimización de stock basándote en cantidades.
  3. Resumen de la salud general del inventario.
  
  Inventario:
  ${inventorySummary}
  
  Responde en español con un tono profesional médico-administrativo.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al analizar con IA. Inténtalo de nuevo más tarde.";
  }
};
