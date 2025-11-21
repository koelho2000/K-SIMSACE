
export enum PointType {
  DI = 'DI', // Digital Input
  DO = 'DO', // Digital Output
  AI = 'AI', // Analog Input
  AO = 'AO', // Analog Output
  VIRTUAL = 'VIRTUAL' // Software point / Setpoint
}

export interface GtcPoint {
  id: string;
  name: string;
  type: PointType;
  description: string;
  signalType?: string; // e.g., 0-10V, 4-20mA, Dry Contact, PT100
  unit?: string; // e.g., °C, %, Pa, On/Off
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number; // New field for multiplier
  points: GtcPoint[];
}

export interface ProjectInfo {
  projectName: string;
  location: string;
  clientName: string;
  technicianName: string;
  technicianCompany: string;
  // New Building Data
  buildingType?: string; // e.g., Office, Hotel, Hospital, School, Residential
  estimatedArea?: string; // in m2
  thermalPower?: string; // in kW
}

export interface GenerationResponse {
  points: GtcPoint[];
}

// Budget Types
export interface BudgetItem {
  category: 'HARDWARE' | 'FIELD_DEVICES' | 'ELECTRICAL' | 'SERVICES';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string; // e.g., "un", "m", "h", "lot"
}

export interface BudgetProposal {
  items: BudgetItem[];
  currency: string;
  total: number;
  assumptions: string[]; // Notes about the budget
}

// EN15232 Types
export type EN15232Class = 'A' | 'B' | 'C' | 'D';

export interface EN15232ChecklistItem {
  category: string; // e.g. "1. Heating Control", "2. Ventilation"
  function: string; // e.g., "Controlo de Aquecimento"
  status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  observation: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface EN15232Analysis {
  projectClass: EN15232Class;
  efficiencyScore: number; // 0 to 100
  summary: string;
  checklist: EN15232ChecklistItem[];
  recommendations: string[];
}
