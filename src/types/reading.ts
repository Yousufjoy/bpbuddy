export type BPCategory = 
  | 'normal'
  | 'elevated'
  | 'stage1'
  | 'stage2'
  | 'crisis'
  | 'low';

export interface BPCategoryInfo {
  category: BPCategory;
  label: string;
  badgeLabel: string;
  color: string;
  bgColor: string;
  description: string;
  actionGuidance?: string;
  isConcerning?: boolean;
}

export interface BloodPressureReading {
  id: string;
  userId?: string | null;
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  measuredAt: string; // ISO 8601 string
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted';
}

export type TimeFilterPeriod = 'week' | 'month' | '3months' | 'year' | 'all';
