import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Medicine, MedicineSchedule, ScheduledDoseItem, TimeOfDay } from '../types/medicine';
import { BloodPressureReading } from '../types/reading';
import { MedicineDoseLog } from '../types/dose';

import SQLiteModule from './sqlite';


const DB_NAME = 'bp_buddy.db';
let dbInstance: any = null;
let initPromise: Promise<void> | null = null;

// Storage keys for web/fallback
const STORAGE_KEYS = {
  READINGS: '@bp_buddy_readings',
  MEDICINES: '@bp_buddy_medicines',
  SCHEDULES: '@bp_buddy_schedules',
  DOSE_LOGS: '@bp_buddy_dose_logs',
  SETTINGS: '@bp_buddy_settings',
};

export async function initDatabase(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (Platform.OS !== 'web' && SQLiteModule) {
      try {
        if (!dbInstance) {
          dbInstance = await SQLiteModule.openDatabaseAsync(DB_NAME);
        }

        await dbInstance.execAsync(`
          PRAGMA journal_mode = WAL;
          
          CREATE TABLE IF NOT EXISTS blood_pressure_readings (
            id TEXT PRIMARY KEY NOT NULL,
            user_id TEXT,
            systolic INTEGER NOT NULL,
            diastolic INTEGER NOT NULL,
            pulse INTEGER,
            measured_at TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            sync_status TEXT DEFAULT 'pending'
          );

          CREATE TABLE IF NOT EXISTS medicines (
            id TEXT PRIMARY KEY NOT NULL,
            user_id TEXT,
            name TEXT NOT NULL,
            dose TEXT NOT NULL,
            instructions TEXT,
            frequency TEXT NOT NULL DEFAULT 'daily',
            start_date TEXT NOT NULL,
            end_date TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            sync_status TEXT DEFAULT 'pending'
          );

          CREATE TABLE IF NOT EXISTS medicine_schedules (
            id TEXT PRIMARY KEY NOT NULL,
            medicine_id TEXT NOT NULL,
            user_id TEXT,
            scheduled_time TEXT NOT NULL,
            time_of_day TEXT NOT NULL DEFAULT 'morning',
            days_of_week TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
            active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS medicine_dose_logs (
            id TEXT PRIMARY KEY NOT NULL,
            medicine_id TEXT NOT NULL,
            schedule_id TEXT,
            user_id TEXT,
            scheduled_for TEXT NOT NULL,
            status TEXT NOT NULL,
            taken_at TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
          );
        `);
        console.log('SQLite database initialized successfully');
        return;
      } catch (error) {
        console.warn('Failed to initialize SQLite, falling back to AsyncStorage:', error);
        dbInstance = null;
      }
    }

    // Web / Fallback storage: ensure keys exist
    for (const key of Object.values(STORAGE_KEYS)) {
      const existing = await AsyncStorage.getItem(key);
      if (existing === null) {
        await AsyncStorage.setItem(key, JSON.stringify([]));
      }
    }
  })();

  return initPromise;
}

export async function getDb(): Promise<any> {
  if (!initPromise) {
    await initDatabase();
  } else {
    await initPromise;
  }
  return dbInstance;
}

// ==========================================
// BLOOD PRESSURE READINGS CRUD
// ==========================================

export async function getAllReadings(): Promise<BloodPressureReading[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.getAllAsync(
        `SELECT * FROM blood_pressure_readings WHERE sync_status != 'deleted' ORDER BY measured_at DESC`
      );
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          systolic: r.systolic,
          diastolic: r.diastolic,
          pulse: r.pulse,
          measuredAt: r.measured_at,
          notes: r.notes,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          syncStatus: r.sync_status,
        }));
      }
    } catch (err) {
      console.warn('SQLite getAllReadings failed, falling back to AsyncStorage cache:', err);
    }
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.READINGS);
  const list: BloodPressureReading[] = raw ? JSON.parse(raw) : [];
  return list
    .filter((r) => r.syncStatus !== 'deleted')
    .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
}

export async function getReadingById(id: string): Promise<BloodPressureReading | null> {
  if (dbInstance) {
    try {
      const row = await dbInstance.getFirstAsync(
        `SELECT * FROM blood_pressure_readings WHERE id = ?`,
        [id]
      );
      if (row) {
        return {
          id: row.id,
          userId: row.user_id,
          systolic: row.systolic,
          diastolic: row.diastolic,
          pulse: row.pulse,
          measuredAt: row.measured_at,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          syncStatus: row.sync_status,
        };
      }
    } catch (err) {
      console.warn('SQLite getReadingById failed, falling back to AsyncStorage cache:', err);
    }
  }

  const list = await getAllReadings();
  return list.find((r) => r.id === id) || null;
}

export async function saveReading(reading: BloodPressureReading): Promise<void> {
  // Always update AsyncStorage cache for reliable offline persistence
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.READINGS);
    const list: BloodPressureReading[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((r) => r.id === reading.id);
    if (index >= 0) {
      list[index] = reading;
    } else {
      list.unshift(reading);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(list));
  } catch (storageErr) {
    console.warn('AsyncStorage cache write failed:', storageErr);
  }

  if (dbInstance) {
    try {
      await dbInstance.runAsync(
        `INSERT INTO blood_pressure_readings (id, user_id, systolic, diastolic, pulse, measured_at, notes, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           systolic = excluded.systolic,
           diastolic = excluded.diastolic,
           pulse = excluded.pulse,
           measured_at = excluded.measured_at,
           notes = excluded.notes,
           updated_at = excluded.updated_at,
           sync_status = excluded.sync_status`,
        [
          reading.id,
          reading.userId || null,
          reading.systolic,
          reading.diastolic,
          reading.pulse ?? null,
          reading.measuredAt,
          reading.notes || null,
          reading.createdAt,
          reading.updatedAt,
          reading.syncStatus || 'pending',
        ]
      );
    } catch (err) {
      console.warn('SQLite saveReading failed:', err);
    }
  }
}

export async function deleteReading(id: string, hardDelete = false): Promise<void> {
  const now = new Date().toISOString();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.READINGS);
    let list: BloodPressureReading[] = raw ? JSON.parse(raw) : [];
    if (hardDelete) {
      list = list.filter((r) => r.id !== id);
    } else {
      list = list.map((r) => (r.id === id ? { ...r, syncStatus: 'deleted', updatedAt: now } : r));
    }
    await AsyncStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(list));
  } catch (storageErr) {
    console.warn('AsyncStorage deleteReading failed:', storageErr);
  }

  if (dbInstance) {
    try {
      if (hardDelete) {
        await dbInstance.runAsync(`DELETE FROM blood_pressure_readings WHERE id = ?`, [id]);
      } else {
        await dbInstance.runAsync(
          `UPDATE blood_pressure_readings SET sync_status = 'deleted', updated_at = ? WHERE id = ?`,
          [now, id]
        );
      }
    } catch (err) {
      console.warn('SQLite deleteReading failed:', err);
    }
  }
}

// ==========================================
// MEDICINES CRUD
// ==========================================

export async function getAllMedicines(includeInactive = false): Promise<Medicine[]> {
  const db = await getDb();
  if (db) {
    try {
      const query = includeInactive
        ? `SELECT * FROM medicines WHERE sync_status != 'deleted' ORDER BY created_at DESC`
        : `SELECT * FROM medicines WHERE sync_status != 'deleted' AND active = 1 ORDER BY created_at DESC`;
      const rows = await db.getAllAsync(query);
      
      if (rows && rows.length > 0) {
        const medicines: Medicine[] = [];
        for (const r of rows) {
          const scheduleRows = await db.getAllAsync(
            `SELECT * FROM medicine_schedules WHERE medicine_id = ? AND active = 1`,
            [r.id]
          );
          medicines.push({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            dose: r.dose,
            instructions: r.instructions,
            frequency: r.frequency,
            startDate: r.start_date,
            endDate: r.end_date,
            active: Boolean(r.active),
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            syncStatus: r.sync_status,
            schedules: scheduleRows.map((s: any) => ({
              id: s.id,
              medicineId: s.medicine_id,
              scheduledTime: s.scheduled_time,
              timeOfDay: s.time_of_day,
              daysOfWeek: JSON.parse(s.days_of_week || '[0,1,2,3,4,5,6]'),
              active: Boolean(s.active),
              createdAt: s.created_at,
              updatedAt: s.updated_at,
            })),
          });
        }
        return medicines;
      }
    } catch (err) {
      console.warn('SQLite getAllMedicines failed, using storage cache:', err);
    }
  }

  const rawMeds = await AsyncStorage.getItem(STORAGE_KEYS.MEDICINES);
  const rawScheds = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
  const meds: Medicine[] = rawMeds ? JSON.parse(rawMeds) : [];
  const scheds: MedicineSchedule[] = rawScheds ? JSON.parse(rawScheds) : [];

  const result = meds
    .filter((m) => m.syncStatus !== 'deleted' && (includeInactive ? true : m.active))
    .map((m) => ({
      ...m,
      schedules: scheds.filter((s) => s.medicineId === m.id && s.active),
    }));

  // Self-heal SQLite database if db was initialized but empty
  if (db && result.length > 0) {
    for (const m of result) {
      try {
        await db.runAsync(
          `INSERT INTO medicines (id, user_id, name, dose, instructions, frequency, start_date, end_date, active, created_at, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET active = excluded.active`,
          [
            m.id,
            m.userId || null,
            m.name,
            m.dose,
            m.instructions || null,
            m.frequency,
            m.startDate,
            m.endDate || null,
            m.active ? 1 : 0,
            m.createdAt,
            m.updatedAt,
            m.syncStatus || 'pending',
          ]
        );
        if (m.schedules && m.schedules.length > 0) {
          for (const s of m.schedules) {
            await db.runAsync(
              `INSERT INTO medicine_schedules (id, medicine_id, user_id, scheduled_time, time_of_day, days_of_week, active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET active = excluded.active`,
              [
                s.id,
                m.id,
                m.userId || null,
                s.scheduledTime,
                s.timeOfDay,
                JSON.stringify(s.daysOfWeek),
                s.active ? 1 : 0,
                s.createdAt,
                s.updatedAt,
              ]
            );
          }
        }
      } catch {
        // ignore background healing
      }
    }
  }

  return result;
}

export async function getMedicineById(id: string): Promise<Medicine | null> {
  const list = await getAllMedicines(true);
  return list.find((m) => m.id === id) || null;
}

export async function saveMedicine(medicine: Medicine): Promise<void> {
  // Always update AsyncStorage cache first so it persists immediately
  try {
    const rawMeds = await AsyncStorage.getItem(STORAGE_KEYS.MEDICINES);
    const meds: Medicine[] = rawMeds ? JSON.parse(rawMeds) : [];
    const idx = meds.findIndex((m) => m.id === medicine.id);
    if (idx >= 0) {
      meds[idx] = medicine;
    } else {
      meds.unshift(medicine);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));

    if (medicine.schedules && medicine.schedules.length > 0) {
      const rawScheds = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
      let scheds: MedicineSchedule[] = rawScheds ? JSON.parse(rawScheds) : [];
      scheds = scheds.filter((s) => s.medicineId !== medicine.id);
      scheds.push(...medicine.schedules);
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(scheds));
    }
  } catch (storageErr) {
    console.warn('AsyncStorage saveMedicine failed:', storageErr);
  }

  const db = await getDb();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO medicines (id, user_id, name, dose, instructions, frequency, start_date, end_date, active, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           dose = excluded.dose,
           instructions = excluded.instructions,
           frequency = excluded.frequency,
           start_date = excluded.start_date,
           end_date = excluded.end_date,
           active = excluded.active,
           updated_at = excluded.updated_at,
           sync_status = excluded.sync_status`,
        [
          medicine.id,
          medicine.userId || null,
          medicine.name,
          medicine.dose,
          medicine.instructions || null,
          medicine.frequency,
          medicine.startDate,
          medicine.endDate || null,
          medicine.active ? 1 : 0,
          medicine.createdAt,
          medicine.updatedAt,
          medicine.syncStatus || 'pending',
        ]
      );

      // Save schedules if provided
      if (medicine.schedules && medicine.schedules.length > 0) {
        await db.runAsync(`DELETE FROM medicine_schedules WHERE medicine_id = ?`, [medicine.id]);
        for (const s of medicine.schedules) {
          await db.runAsync(
            `INSERT INTO medicine_schedules (id, medicine_id, user_id, scheduled_time, time_of_day, days_of_week, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.id,
              medicine.id,
              medicine.userId || null,
              s.scheduledTime,
              s.timeOfDay,
              JSON.stringify(s.daysOfWeek),
              s.active ? 1 : 0,
              s.createdAt,
              s.updatedAt,
            ]
          );
        }
      }
    } catch (err) {
      console.warn('SQLite saveMedicine failed:', err);
    }
  }
}

export async function deleteMedicine(id: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const rawMeds = await AsyncStorage.getItem(STORAGE_KEYS.MEDICINES);
    let meds: Medicine[] = rawMeds ? JSON.parse(rawMeds) : [];
    meds = meds.map((m) =>
      m.id === id ? { ...m, active: false, syncStatus: 'deleted', updatedAt: now } : m
    );
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));

    const rawScheds = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
    let scheds: MedicineSchedule[] = rawScheds ? JSON.parse(rawScheds) : [];
    scheds = scheds.map((s) => (s.medicineId === id ? { ...s, active: false, updatedAt: now } : s));
    await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(scheds));
  } catch (storageErr) {
    console.warn('AsyncStorage deleteMedicine failed:', storageErr);
  }

  const db = await getDb();
  if (db) {
    try {
      await db.runAsync(
        `UPDATE medicines SET sync_status = 'deleted', active = 0, updated_at = ? WHERE id = ?`,
        [now, id]
      );
      await db.runAsync(
        `UPDATE medicine_schedules SET active = 0, updated_at = ? WHERE medicine_id = ?`,
        [now, id]
      );
    } catch (err) {
      console.warn('SQLite deleteMedicine failed:', err);
    }
  }
}

// ==========================================
// DOSE LOGS & DAILY CHECKLIST
// ==========================================

export async function getDoseLogs(): Promise<MedicineDoseLog[]> {
  if (dbInstance) {
    try {
      const rows = await dbInstance.getAllAsync(
        `SELECT d.*, m.name as medicine_name, m.dose as dose
         FROM medicine_dose_logs d
         LEFT JOIN medicines m ON d.medicine_id = m.id
         WHERE d.sync_status != 'deleted'
         ORDER BY d.scheduled_for DESC`
      );
      if (rows) {
        return rows.map((r: any) => ({
          id: r.id,
          medicineId: r.medicine_id,
          scheduleId: r.schedule_id,
          scheduledFor: r.scheduled_for,
          status: r.status,
          takenAt: r.taken_at,
          notes: r.notes,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          medicineName: r.medicine_name,
          dose: r.dose,
        }));
      }
    } catch (err) {
      console.warn('SQLite getDoseLogs failed, using storage cache:', err);
    }
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
  return raw ? JSON.parse(raw) : [];
}

export async function upsertDoseLog(log: MedicineDoseLog): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
    const list: MedicineDoseLog[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((l) => l.id === log.id || (l.medicineId === log.medicineId && l.scheduledFor === log.scheduledFor));
    if (idx >= 0) {
      list[idx] = log;
    } else {
      list.unshift(log);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(list));
  } catch (storageErr) {
    console.warn('AsyncStorage upsertDoseLog failed:', storageErr);
  }

  if (dbInstance) {
    try {
      await dbInstance.runAsync(
        `INSERT INTO medicine_dose_logs (id, medicine_id, schedule_id, scheduled_for, status, taken_at, notes, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status,
           taken_at = excluded.taken_at,
           notes = excluded.notes,
           updated_at = excluded.updated_at,
           sync_status = excluded.sync_status`,
        [
          log.id,
          log.medicineId,
          log.scheduleId || null,
          log.scheduledFor,
          log.status,
          log.takenAt || null,
          log.notes || null,
          log.createdAt,
          log.updatedAt,
          log.syncStatus || 'pending',
        ]
      );
    } catch (err) {
      console.warn('SQLite upsertDoseLog failed:', err);
    }
  }
}

/**
 * Generate today's checklist items merged with logged status
 */
export async function getTodayDoses(targetDate: Date = new Date()): Promise<ScheduledDoseItem[]> {
  const medicines = await getAllMedicines(false);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const dayOfWeek = targetDate.getDay(); // 0 = Sun

  const logs = await getDoseLogs();
  const doseItems: ScheduledDoseItem[] = [];

  for (const med of medicines) {
    if (!med.schedules || med.schedules.length === 0) continue;

    for (const sched of med.schedules) {
      if (!sched.daysOfWeek.includes(dayOfWeek)) continue;

      const scheduledFor = `${dateStr}T${sched.scheduledTime}:00`;
      // Find existing log
      const existingLog = logs.find(
        (l) => l.medicineId === med.id && l.scheduledFor.startsWith(dateStr) && (l.scheduleId === sched.id || l.scheduledFor === scheduledFor)
      );

      // format 12h time string
      const [h, m] = sched.scheduledTime.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = (h % 12 || 12).toString().padStart(2, '0');
      const timeStr = `${formattedH}:${m.toString().padStart(2, '0')} ${ampm}`;

      doseItems.push({
        id: existingLog ? existingLog.id : `dose_${med.id}_${sched.id}_${dateStr}`,
        medicineId: med.id,
        scheduleId: sched.id,
        medicineName: med.name,
        dose: med.dose,
        instructions: med.instructions,
        scheduledTime: timeStr,
        scheduledFor,
        timeOfDay: sched.timeOfDay,
        status: existingLog ? existingLog.status : 'pending',
        takenAt: existingLog ? existingLog.takenAt : null,
        logId: existingLog ? existingLog.id : undefined,
      });
    }
  }

  // Sort chronological
  return doseItems.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
}

// ==========================================
// SETTINGS KV
// ==========================================

export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  if (dbInstance) {
    try {
      const row = await dbInstance.getFirstAsync(`SELECT value FROM app_settings WHERE key = ?`, [key]);
      if (row) return row.value;
    } catch {
      // Fallback
    }
  }
  const val = await AsyncStorage.getItem(`@setting_${key}`);
  return val !== null ? val : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(`@setting_${key}`, value);
  if (dbInstance) {
    try {
      await dbInstance.runAsync(
        `INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, value]
      );
    } catch (err) {
      console.warn('SQLite setSetting failed:', err);
    }
  }
}
