import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getAllMedicines } from '../database/database';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MEDICINE_CHANNEL_ID = 'medicine-reminders';

// Check if running inside Expo Go client app
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Initialize Android notification channel and request permissions
 */
export async function setupNotificationChannels(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  // On Android, configure custom notification channel if supported.
  // In Expo Go, setNotificationChannelAsync throws a NullPointerException
  // because ExpoNotificationChannelManager expects a native module provider that is only bundled in standalone/dev builds.
  // Skipping or safely catching channel setup in Expo Go allows notifications and permission requests to proceed without crashing.
  if (Platform.OS === 'android' && !isExpoGo) {
    try {
      await Notifications.setNotificationChannelAsync(MEDICINE_CHANNEL_ID, {
        name: 'Medicine Reminders',
        description: 'Scheduled reminders to take your prescribed medication on time',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1677F2',
        sound: 'default',
      });
    } catch (channelError) {
      console.log('Notice: Custom notification channel could not be registered, continuing with default channel:', channelError);
    }
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Reconcile and schedule notifications for all active medicines
 */
export async function scheduleAllMedicineNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await setupNotificationChannels();
    if (!hasPermission) return;

    // Cancel previously scheduled medicine notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const medicines = await getAllMedicines(false);

    for (const med of medicines) {
      if (!med.active || !med.schedules) continue;

      for (const sched of med.schedules) {
        if (!sched.active) continue;

        const [hourStr, minStr] = sched.scheduledTime.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        // Daily repeating notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for your medicine — ${med.name} ${med.dose}`,
            body: med.instructions
              ? `${med.instructions}. Tap to mark as taken.`
              : 'Stay consistent to help keep your blood pressure stable.',
            sound: 'default',
            data: { medicineId: med.id, scheduleId: sched.id },
            ...(Platform.OS === 'android' && !isExpoGo ? { channelId: MEDICINE_CHANNEL_ID } : {}),
          } as any,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }
    }
    console.log('Successfully scheduled medicine reminders');
  } catch (error) {
    console.warn('Failed to schedule medicine reminders:', error);
  }
}

/**
 * Send an immediate test notification to verify system settings & sound
 */
export async function sendTestNotification(): Promise<boolean> {
  if (Platform.OS === 'web') {
    alert('Time for your medicine — Lisinopril 10mg (Web simulated notification)');
    return true;
  }

  try {
    const hasPermission = await setupNotificationChannels();
    if (!hasPermission) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'BP Buddy Reminder — Test',
        body: 'Time for your medicine — Lisinopril 10mg. Stay consistent!',
        sound: 'default',
        ...(Platform.OS === 'android' && !isExpoGo ? { channelId: MEDICINE_CHANNEL_ID } : {}),
      } as any,
      trigger: null, // immediate
    });
    return true;
  } catch (error) {
    console.error('Failed to trigger test notification:', error);
    return false;
  }
}
