export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type FrequencyType = 'daily' | 'twice_daily' | 'three_times_daily' | 'specific_days' | 'custom';

export interface MedicineSchedule {
  id: string;
  medicineId: string;
  scheduledTime: string; // HH:mm format (e.g., "09:00", "20:00")
  timeOfDay: TimeOfDay;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (all 7 for daily)
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  userId?: string | null;
  name: string;
  dose: string; // e.g. "10mg", "1 tablet"
  instructions?: string | null; // e.g. "After food", "With water"
  frequency: FrequencyType;
  startDate: string;
  endDate?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  schedules?: MedicineSchedule[];
  syncStatus?: 'synced' | 'pending' | 'deleted';
}

export interface ScheduledDoseItem {
  id: string; // log id or unique instance key
  medicineId: string;
  scheduleId?: string;
  medicineName: string;
  dose: string;
  instructions?: string | null;
  scheduledTime: string; // "09:00 AM"
  scheduledFor: string; // ISO date-time string
  timeOfDay: TimeOfDay;
  status: 'pending' | 'taken' | 'skipped';
  takenAt?: string | null;
  logId?: string;
}
