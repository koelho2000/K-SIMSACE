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
  points: GtcPoint[];
}

export interface GenerationResponse {
  points: GtcPoint[];
}