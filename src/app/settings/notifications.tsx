import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { sendTestNotification, setupNotificationChannels, scheduleAllMedicineNotifications } from '../../services/notifications';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function NotificationsSettingScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [testing, setTesting] = useState(false);

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert(
          t('test_reminder_title', 'Reminder Sent!'),
          t('test_reminder_sent', 'A test reminder notification has been triggered. Check your device notification tray.')
        );
      } else {
        Alert.alert(
          t('notification_notice', 'Notification Notice'),
          t('notification_permission_msg', 'Notification permission was not granted or is disabled in device system settings.')
        );
      }
    } finally {
      setTesting(false);
    }
  };

  const handleToggleReminders = async () => {
    const next = !remindersEnabled;
    setRemindersEnabled(next);
    if (next) {
      await setupNotificationChannels();
      await scheduleAllMedicineNotifications();
      Alert.alert(t('reminders_enabled', 'Reminders Enabled'), t('reminders_enabled_msg', 'All active medicine schedules have been scheduled.'));
    } else {
      Alert.alert(t('reminders_paused', 'Reminders Paused'), t('reminders_paused_msg', 'Notifications have been paused.'));
    }
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { fontSize: fs(17) }]} numberOfLines={1}>
          {t('reminders_title', 'Reminders & Alerts')}
        </Text>
        <View style={styles.mascotChip}>
          <BPMascot size={32} mood="medicine" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Toggle Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="notifications" size={22} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.toggleTitle}>{t('medicine_reminders', 'Medicine Reminders')}</Text>
                <Text style={styles.toggleSub}>
                  {remindersEnabled ? t('scheduled_locally', 'Scheduled locally on device') : t('reminders_paused', 'Reminders paused')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.switch,
                remindersEnabled ? styles.switchActive : styles.switchInactive,
              ]}
              onPress={handleToggleReminders}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.switchThumb,
                  remindersEnabled
                    ? styles.switchThumbActive
                    : styles.switchThumbInactive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Notification Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.sectionTitle}>{t('reminders_title', 'Test Device Notifications')}</Text>
          <Text style={styles.sectionDesc}>
            {t('reminders_sub', 'Trigger an immediate local reminder alert to verify vibration, notification sound, and system tray delivery on this device.')}
          </Text>

          <PrimaryButton
            title={t('test_reminder_btn', 'Send Test Notification')}
            icon={<Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />}
            onPress={handleTestNotification}
            loading={testing}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Reliability Guidelines */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.sectionTitle}>{t('offline_first_title', 'Reliability Guidelines')}</Text>
          
          <View style={styles.guidelineItem}>
            <View style={[styles.guidelineIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="battery-charging-outline" size={20} color={Colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guidelineHeading}>{t('settings_more', 'Battery Optimization')}</Text>
              <Text style={styles.guidelineText}>
                {t('offline_first_desc', 'Set BP Buddy battery usage to unrestricted in device system settings to ensure alarms are never delayed by power-saving modes.')}
              </Text>
            </View>
          </View>

          <View style={[styles.guidelineItem, { marginTop: 14 }]}>
            <View style={[styles.guidelineIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="cloud-offline-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guidelineHeading}>{t('offline_first_title', '100% Offline Capability')}</Text>
              <Text style={styles.guidelineText}>
                {t('offline_first_desc', 'All medicine alarms are scheduled directly on your operating system’s local notification daemon. They trigger reliably even in airplane mode.')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  mascotChip: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
    flexShrink: 0,
  },
  switchActive: {
    backgroundColor: Colors.primary,
  },
  switchInactive: {
    backgroundColor: '#CBD5E1',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  guidelineIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  guidelineText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
