export interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface Winner extends Employee {
  wonAt: number; // Timestamp
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  image: string;
  totalCount: number;
  unitPrice: number;
  winners: Winner[];
  rank: number; // 1 is highest (Grand Prize), higher numbers are lower prizes
}

export type ViewMode = 'display' | 'admin';

export interface AppState {
  prizes: Prize[];
  candidates: Employee[];
  viewMode: ViewMode;
  isDrawing: boolean;
  lastWinnerId: string | null;
}