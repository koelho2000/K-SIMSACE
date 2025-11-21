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