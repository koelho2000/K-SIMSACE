import { GoogleGenAI, Type } from "@google/genai";
import { PointType, GtcPoint } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generatePointsForEquipment = async (
  equipmentName: string, 
  context: string = ''
): Promise<GtcPoint[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [];
  }

  const modelId = 'gemini-2.5-flash';

  const systemInstruction = `
    Você é um Engenheiro Sénior de Automação e Gestão Técnica Centralizada (GTC/BMS) com vasta experiência em projetos de AVAC, Eletricidade e Hidráulica.
    
    OBJETIVO:
    Gerar uma lista técnica rigorosa de Pontos de Dados (Data Points) para um equipamento, baseada estritamente na configuração técnica fornecida.
    
    REGRAS PARA TIPOS DE PONTOS:
    - DI (Digital Input): Estado de funcionamento, Disparo de térmico/Disjuntor, Alarmes de filtro, Pressostatos.
    - DO (Digital Output): Comando de Marcha/Paragem, Habilitação.
    - AI (Analog Input): Sondas de Temperatura, Humidade, Pressão, CO2, Posição de válvula.
    - AO (Analog Output): Comando de Válvulas (0-10V), Variadores de Frequência (0-10V).
    
    DIRETRIZES DE QUALIDADE:
    1. Seja específico. Não use nomes genéricos. Use "Temperatura de Insuflação" em vez de "Temperatura".
    2. Respeite o "Contexto do Equipamento". Se o utilizador selecionou "Recuperação de Calor", OBRIGATORIAMENTE inclua pontos para controlo do recuperador (Comando, Estado, Alarme).
    3. Defina o "signalType" correto (ex: PT100, 0-10V, 4-20mA, Contacto Seco).
    4. Responda em Português de Portugal.
  `;

  const prompt = `
    EQUIPAMENTO: "${equipmentName}"
    
    CONFIGURAÇÃO TÉCNICA DETALHADA (Contexto):
    ${context}
    
    Com base na configuração acima, gere a lista de pontos de Hardware (I/O físico) e pontos virtuais essenciais (Setpoints).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome técnico do ponto" },
                  type: { 
                    type: Type.STRING, 
                    enum: ["DI", "DO", "AI", "AO", "VIRTUAL"],
                    description: "Tipo de I/O" 
                  },
                  description: { type: Type.STRING, description: "Descrição funcional" },
                  signalType: { type: Type.STRING, description: "Sinal elétrico (ex: 0-10V, PT100, Contacto Seco)" },
                  unit: { type: Type.STRING, description: "Unidade (ex: °C, %, Pa, Estado)" }
                },
                required: ["name", "type", "description", "signalType", "unit"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    
    // Add IDs to points
    const pointsWithIds = data.points.map((p: any) => ({
      ...p,
      id: crypto.randomUUID()
    }));

    return pointsWithIds;

  } catch (error) {
    console.error("Error generating points:", error);
    return [];
  }
};