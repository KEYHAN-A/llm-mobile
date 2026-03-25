export type ModelStatus =
  | 'unloaded'
  | 'loading'
  | 'ready'
  | 'error'
  | 'downloading';

export interface MemoryInfo {
  totalRAM: number;
  usedRAM: number;
  availableRAM: number;
  modelEstimate: number;
}

export interface MemoryCheckResult {
  canLoad: boolean;
  totalRAM: number;
  usedRAM: number;
  availableRAM: number;
  reason?: string;
}
