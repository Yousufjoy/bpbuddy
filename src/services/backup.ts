import { getAllReadings, getAllMedicines, getDoseLogs, saveReading, saveMedicine, upsertDoseLog } from '../database/database';
import { BloodPressureReading } from '../types/reading';
import { Medicine } from '../types/medicine';
import { MedicineDoseLog } from '../types/dose';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface BackupData {
  version: number;
  exportedAt: string;
  app: 'BP Buddy';
  readings: BloodPressureReading[];
  medicines: Medicine[];
  doseLogs: MedicineDoseLog[];
}

/**
 * Generate full JSON backup object
 */
export async function exportDataAsJson(): Promise<string> {
  const readings = await getAllReadings();
  const medicines = await getAllMedicines(true);
  const doseLogs = await getDoseLogs();

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'BP Buddy',
    readings,
    medicines,
    doseLogs,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Export blood pressure readings as CSV string
 */
export async function exportReadingsAsCsv(): Promise<string> {
  const readings = await getAllReadings();
  const header = 'Date,Time,Systolic,Diastolic,Pulse,Notes\n';
  const rows = readings
    .map((r) => {
      const d = new Date(r.measuredAt);
      const dateStr = d.toISOString().split('T')[0];
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const notesClean = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '';
      return `${dateStr},${timeStr},${r.systolic},${r.diastolic},${r.pulse ?? ''},${notesClean}`;
    })
    .join('\n');

  return header + rows;
}

/**
 * Validate and restore JSON backup data safely without destructive overwrite
 */
export async function restoreFromJson(jsonContent: string): Promise<{
  readingsCount: number;
  medicinesCount: number;
  logsCount: number;
}> {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    throw new Error('Invalid JSON format. Please verify the backup file.');
  }

  if (!parsed || (parsed.app !== 'BP Buddy' && !parsed.readings)) {
    throw new Error('The selected file does not appear to be a valid BP Buddy backup.');
  }

  let readingsCount = 0;
  if (Array.isArray(parsed.readings)) {
    for (const r of parsed.readings) {
      if (r.id && r.systolic && r.diastolic && r.measuredAt) {
        await saveReading({
          id: r.id,
          userId: r.userId || null,
          systolic: Number(r.systolic),
          diastolic: Number(r.diastolic),
          pulse: r.pulse ? Number(r.pulse) : null,
          measuredAt: r.measuredAt,
          notes: r.notes || null,
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
        readingsCount++;
      }
    }
  }

  let medicinesCount = 0;
  if (Array.isArray(parsed.medicines)) {
    for (const m of parsed.medicines) {
      if (m.id && m.name && m.dose) {
        await saveMedicine({
          id: m.id,
          userId: m.userId || null,
          name: m.name,
          dose: m.dose,
          instructions: m.instructions || null,
          frequency: m.frequency || 'daily',
          startDate: m.startDate || new Date().toISOString().split('T')[0],
          endDate: m.endDate || null,
          active: m.active !== undefined ? Boolean(m.active) : true,
          schedules: m.schedules || [],
          createdAt: m.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
        medicinesCount++;
      }
    }
  }

  let logsCount = 0;
  if (Array.isArray(parsed.doseLogs)) {
    for (const l of parsed.doseLogs) {
      if (l.id && l.medicineId && l.scheduledFor) {
        await upsertDoseLog({
          id: l.id,
          medicineId: l.medicineId,
          scheduleId: l.scheduleId || null,
          scheduledFor: l.scheduledFor,
          status: l.status || 'pending',
          takenAt: l.takenAt || null,
          notes: l.notes || null,
          createdAt: l.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });
        logsCount++;
      }
    }
  }

  return { readingsCount, medicinesCount, logsCount };
}
