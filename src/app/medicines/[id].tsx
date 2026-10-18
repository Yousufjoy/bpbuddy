import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { getMedicineById, saveMedicine, deleteMedicine } from '../../database/database';
import { FrequencyType, Medicine, TimeOfDay } from '../../types/medicine';
import { scheduleAllMedicineNotifications } from '../../services/notifications';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function EditMedicineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [instructions, setInstructions] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const timePresets: { label: string; time: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: t('morning', 'Morning'), time: '08:00', icon: 'sunny-outline' },
    { label: t('afternoon', 'Noon'), time: '12:00', icon: 'partly-sunny-outline' },
    { label: t('evening', 'Evening'), time: '18:00', icon: 'cloudy-night-outline' },
    { label: t('night', 'Night'), time: '21:00', icon: 'moon-outline' },
  ];

  const frequencies: { key: FrequencyType; label: string }[] = [
    { key: 'daily', label: t('freq_once', 'Daily') },
    { key: 'twice_daily', label: t('freq_twice', 'Twice daily') },
    { key: 'three_times_daily', label: t('freq_three', '3x daily') },
    { key: 'specific_days', label: t('freq_custom_days', 'Specific days') },
  ];

  useEffect(() => {
    async function load() {
      if (!id) return;
      const m = await getMedicineById(id);
      if (m) {
        setMedicine(m);
        setName(m.name);
        setDose(m.dose);
        setInstructions(m.instructions || '');
        setFrequency(m.frequency);
        setActive(m.active);
        if (m.schedules && m.schedules[0]) {
          setScheduledTime(m.schedules[0].scheduledTime);
        }
      }
    }
    load();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim() || !dose.trim()) {
      Alert.alert(t('required_fields', 'Required Fields'), t('enter_med_name', 'Medicine name and dose are required.'));
      return;
    }

    if (!medicine) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const hour = parseInt(scheduledTime.split(':')[0], 10);
      let timeOfDay: TimeOfDay = 'morning';
      if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else if (hour >= 21 || hour < 6) timeOfDay = 'night';

      const updatedSchedules = [
        {
          id: (medicine.schedules && medicine.schedules[0]?.id) || `sched_${Date.now()}`,
          medicineId: medicine.id,
          scheduledTime,
          timeOfDay,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          active,
          createdAt: medicine.createdAt,
          updatedAt: now,
        },
      ];

      const updatedMedicine: Medicine = {
        ...medicine,
        name: name.trim(),
        dose: dose.trim(),
        instructions: instructions.trim() || null,
        frequency,
        active,
        schedules: updatedSchedules,
        updatedAt: now,
        syncStatus: 'pending',
      };

      await saveMedicine(updatedMedicine);
      try {
        await scheduleAllMedicineNotifications();
      } catch (notifErr) {
        console.warn('Notification scheduling error ignored:', notifErr);
      }
      Alert.alert(t('saved', 'Saved'), t('med_updated_msg', 'Medicine details and reminders updated.'));
      router.back();
    } catch (e) {
      console.error('Failed to update medicine:', e);
      Alert.alert(t('error', 'Error'), t('save_med_error', 'Could not save updates.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete_med_title', 'Delete Medicine'),
      t('delete_med_prompt', `Delete ${name || 'this medicine'}? Scheduled alerts will be removed, but previous dose history will be preserved.`),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteMedicine(id);
              try {
                await scheduleAllMedicineNotifications();
              } catch (notifErr) {
                console.warn('Notification scheduling error ignored:', notifErr);
              }
              router.back();
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { fontSize: fs(17) }]} numberOfLines={1}>
            {t('edit_medicine', 'Edit Medicine')}
          </Text>
          <TouchableOpacity onPress={handleDelete} style={[styles.backButton, { borderColor: '#FEE2E2' }]}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Mascot Banner */}
          <View style={[styles.mascotBanner, Shadows.card]}>
            <BPMascot size={56} mood="medicine" />
            <View style={{ flex: 1 }}>
              <Text style={styles.mascotBannerTitle}>
                {t('med_reminder_banner', 'Personal Prescription')}
              </Text>
              <Text style={styles.mascotBannerDesc}>
                {t('med_reminder_banner_sub', 'Keep dosage and intake timing aligned with your doctor’s treatment plan.')}
              </Text>
            </View>
          </View>

          {/* Core Info Card */}
          <View style={[styles.card, Shadows.card]}>
            <Text style={styles.cardHeader}>{t('medicine_name', 'Medication Details')}</Text>

            <Text style={styles.fieldLabel}>{t('medicine_name', 'Medicine Name')} *</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="pill" size={18} color={Colors.primary} style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Amlodipine, Lisinopril"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t('dosage', 'Dosage')} *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="fitness-outline" size={18} color={Colors.primary} style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                value={dose}
                onChangeText={setDose}
                placeholder="e.g. 5 mg, 1 tablet"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t('instructions', 'Instructions & Notes')}</Text>
            <View style={styles.inputRow}>
              <Ionicons name="document-text-outline" size={18} color={Colors.primary} style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g. With breakfast, avoid grapefruit"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Frequency Selector */}
          <View style={[styles.card, Shadows.card]}>
            <Text style={styles.cardHeader}>{t('frequency', 'Frequency')}</Text>
            <View style={styles.chipsRow}>
              {frequencies.map((f) => {
                const isSelected = frequency === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setFrequency(f.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Time Presets & Input */}
          <View style={[styles.card, Shadows.card]}>
            <Text style={styles.cardHeader}>{t('time_of_day', 'Reminder Time')}</Text>
            <Text style={styles.fieldSub}>{t('clock_helper_text', 'Choose a routine slot or enter a precise 24h time:')}</Text>

            <View style={styles.presetsGrid}>
              {timePresets.map((p) => {
                const isSelected = scheduledTime === p.time;
                return (
                  <TouchableOpacity
                    key={p.time}
                    style={[styles.presetCard, isSelected && styles.presetCardActive]}
                    onPress={() => setScheduledTime(p.time)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={p.icon}
                      size={18}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                    <Text style={[styles.presetLabel, isSelected && styles.presetLabelActive]}>
                      {p.label}
                    </Text>
                    <Text style={[styles.presetTime, isSelected && styles.presetTimeActive]}>
                      {p.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.inputRow, { marginTop: 14 }]}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                value={scheduledTime}
                onChangeText={setScheduledTime}
                placeholder="09:00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Active Reminder Toggle */}
          <View style={[styles.toggleCard, Shadows.card]}>
            <View style={styles.toggleLeft}>
              <View style={[styles.iconCircle, { backgroundColor: active ? Colors.primaryLight : '#F1F5F9' }]}>
                <Ionicons
                  name={active ? 'notifications' : 'notifications-off-outline'}
                  size={20}
                  color={active ? Colors.primary : Colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>{t('medicine_reminders', 'Daily Reminders')}</Text>
                <Text style={styles.toggleSub}>
                  {active ? t('scheduled_locally', 'Alarms & notifications enabled') : t('reminders_paused', 'Reminders paused')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.switch, active ? styles.switchActive : styles.switchInactive]}
              onPress={() => setActive(!active)}
              activeOpacity={0.8}
            >
              <View style={[styles.switchThumb, active ? styles.switchThumbActive : styles.switchThumbInactive]} />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <PrimaryButton
            title={t('save_med_changes', 'Save Medicine Changes')}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 6 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    flexGrow: 1,
  },
  mascotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  mascotBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  mascotBannerDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  fieldSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  presetsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  presetCard: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetCardActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  presetLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  presetTime: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  presetTimeActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  toggleSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
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
});
