import { TimeOfDay } from './medicine';

export type DoseStatus = 'pending' | 'taken' | 'skipped';

export interface MedicineDoseLog {
  id: string;
  medicineId: string;
  scheduleId?: string | null;
  scheduledFor: string; // ISO timestamp
  status: DoseStatus;
  takenAt?: string | null; // ISO timestamp when marked taken
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
  // Joined fields for display:
  medicineName?: string;
  dose?: string;
  timeOfDay?: TimeOfDay;
}
