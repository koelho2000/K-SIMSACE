import { GoogleGenAI, Type } from "@google/genai";
import { PointType, GtcPoint, Equipment, BudgetProposal } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_ID = 'gemini-2.5-flash';

export const generatePointsForEquipment = async (
  equipmentName: string, 
  context: string = ''
): Promise<GtcPoint[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [];
  }

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
      model: MODEL_ID,
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

export const generateBudgetProposal = async (equipmentList: Equipment[]): Promise<BudgetProposal | null> => {
  if (!apiKey) return null;

  // 1. Compile Project Statistics considering Quantity
  let diCount = 0, doCount = 0, aiCount = 0, aoCount = 0;
  equipmentList.forEach(eq => {
    const qty = eq.quantity || 1;
    eq.points.forEach(p => {
      if (p.type === PointType.DI) diCount += qty;
      if (p.type === PointType.DO) doCount += qty;
      if (p.type === PointType.AI) aiCount += qty;
      if (p.type === PointType.AO) aoCount += qty;
    });
  });

  const equipSummary = equipmentList
    .map(e => `- ${e.quantity || 1}x ${e.name} (${e.category})`)
    .join('\n');

  const prompt = `
    Analise os seguintes dados do projeto de GTC (Gestão Técnica Centralizada):
    
    ESTATÍSTICAS DE PONTOS FÍSICOS (I/O) TOTAIS (Já multiplicados pela quantidade de equipamentos):
    - DI: ${diCount}
    - DO: ${doCount}
    - AI: ${aiCount}
    - AO: ${aoCount}
    - TOTAL IO: ${diCount + doCount + aiCount + aoCount}
    
    LISTA DE EQUIPAMENTOS CONTROLADOS (com quantidades):
    ${equipSummary}
    
    TAREFA:
    Crie um ORÇAMENTO ESTIMATIVO detalhado para este projeto.
    
    CATEGORIAS OBRIGATÓRIAS:
    1. HARDWARE: Controladores de Automação (PLCs), Cartas de I/O (considere reserva de 10%), Fontes de Alimentação, UPS de Automação.
    2. FIELD_DEVICES: Equipamento de Campo estimado com base na lista de equipamentos e suas quantidades (Sondas de Temperatura, Pressostatos, Atuadores de Válvula, Atuadores de Registo).
    3. ELECTRICAL: Quadros Elétricos de GTC (estimar tamanho pelo nº de pontos), Cablagem de Campo (estimar média de 20m por ponto), Esteira/Caminhos de cabos.
    4. SERVICES: Engenharia (Desenhos, Esquemas), Programação de Software, Configuração de SCADA, Comissionamento em Obra, Gestão de Obra.
    
    DIRETRIZES DE PREÇOS (Base Europa/Portugal):
    - Use valores realistas de mercado (ex: Engenharia ~50€/h, PLC por ponto ~30€-50€, Cabo ~1.5€/m).
    - UPS pequena: ~250€.
    - Sondas: ~60-120€.
    - Atuadores: ~150-250€.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: "Você é um Diretor Comercial de uma empresa de Engenharia e Automação. Gere um orçamento detalhado em formato JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: ['HARDWARE', 'FIELD_DEVICES', 'ELECTRICAL', 'SERVICES'] },
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  totalPrice: { type: Type.NUMBER }
                }
              }
            },
            currency: { type: Type.STRING, enum: ['EUR'] },
            total: { type: Type.NUMBER },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Budget generation error:", error);
    return null;
  }
};