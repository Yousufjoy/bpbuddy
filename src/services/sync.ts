import { supabase, isSupabaseConfigured } from './supabase';
import {
  getAllReadings,
  saveReading,
  getAllMedicines,
  saveMedicine,
  getDoseLogs,
  upsertDoseLog,
  getSetting,
  setSetting,
} from '../database/database';

export interface SyncStatusResult {
  success: boolean;
  message: string;
  syncedCount: number;
}

/**
 * Synchronize local SQLite data with Supabase cloud database
 */
export async function syncWithCloud(): Promise<SyncStatusResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured. Running in local-first guest mode.',
      syncedCount: 0,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: 'Not signed in. Local data is safely preserved on device.',
      syncedCount: 0,
    };
  }

  try {
    let syncedCount = 0;

    // 1. PUSH Pending Blood Pressure Readings
    const localReadings = await getAllReadings();
    const pendingReadings = localReadings.filter((r) => r.syncStatus === 'pending');

    for (const r of pendingReadings) {
      const { error } = await supabase.from('blood_pressure_readings').upsert({
        id: r.id,
        user_id: user.id,
        systolic: r.systolic,
        diastolic: r.diastolic,
        pulse: r.pulse,
        measured_at: r.measuredAt,
        notes: r.notes,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      });

      if (!error) {
        await saveReading({ ...r, userId: user.id, syncStatus: 'synced' });
        syncedCount++;
      }
    }

    // 2. PUSH Pending Medicines
    const localMedicines = await getAllMedicines(true);
    const pendingMedicines = localMedicines.filter((m) => m.syncStatus === 'pending');

    for (const m of pendingMedicines) {
      const { error } = await supabase.from('medicines').upsert({
        id: m.id,
        user_id: user.id,
        name: m.name,
        dose: m.dose,
        instructions: m.instructions,
        frequency: m.frequency,
        start_date: m.startDate,
        end_date: m.endDate,
        active: m.active,
        created_at: m.createdAt,
        updated_at: m.updatedAt,
      });

      if (!error) {
        // Also push schedules
        if (m.schedules) {
          for (const s of m.schedules) {
            await supabase.from('medicine_schedules').upsert({
              id: s.id,
              medicine_id: m.id,
              user_id: user.id,
              scheduled_time: s.scheduledTime,
              time_of_day: s.timeOfDay,
              days_of_week: s.daysOfWeek,
              active: s.active,
              created_at: s.createdAt,
              updated_at: s.updatedAt,
            });
          }
        }
        await saveMedicine({ ...m, userId: user.id, syncStatus: 'synced' });
        syncedCount++;
      }
    }

    // 3. PUSH Pending Dose Logs
    const localLogs = await getDoseLogs();
    const pendingLogs = localLogs.filter((l) => l.syncStatus === 'pending');

    for (const l of pendingLogs) {
      const { error } = await supabase.from('medicine_dose_logs').upsert({
        id: l.id,
        medicine_id: l.medicineId,
        schedule_id: l.scheduleId,
        user_id: user.id,
        scheduled_for: l.scheduledFor,
        status: l.status,
        taken_at: l.takenAt,
        notes: l.notes,
        created_at: l.createdAt,
        updated_at: l.updatedAt,
      });

      if (!error) {
        await upsertDoseLog({ ...l, syncStatus: 'synced' });
        syncedCount++;
      }
    }

    // 4. PULL Cloud Readings to Local
    const { data: remoteReadings } = await supabase
      .from('blood_pressure_readings')
      .select('*')
      .eq('user_id', user.id);

    if (remoteReadings) {
      for (const rr of remoteReadings) {
        await saveReading({
          id: rr.id,
          userId: rr.user_id,
          systolic: rr.systolic,
          diastolic: rr.diastolic,
          pulse: rr.pulse,
          measuredAt: rr.measured_at,
          notes: rr.notes,
          createdAt: rr.created_at,
          updatedAt: rr.updated_at,
          syncStatus: 'synced',
        });
      }
    }

    const now = new Date().toISOString();
    await setSetting('last_synced_at', now);

    return {
      success: true,
      message: `Sync completed successfully (${syncedCount} items pushed)`,
      syncedCount,
    };
  } catch (error: any) {
    console.error('Error during cloud synchronization:', error);
    return {
      success: false,
      message: error?.message || 'Synchronization failed. Local data preserved.',
      syncedCount: 0,
    };
  }
}

/**
 * Migrate guest data to newly signed-in user account
 */
export async function migrateGuestDataToUser(userId: string): Promise<number> {
  let count = 0;
  const readings = await getAllReadings();
  for (const r of readings) {
    if (!r.userId) {
      await saveReading({ ...r, userId, syncStatus: 'pending' });
      count++;
    }
  }

  const medicines = await getAllMedicines(true);
  for (const m of medicines) {
    if (!m.userId) {
      await saveMedicine({ ...m, userId, syncStatus: 'pending' });
      count++;
    }
  }

  // Trigger sync with cloud
  await syncWithCloud();
  return count;
}
