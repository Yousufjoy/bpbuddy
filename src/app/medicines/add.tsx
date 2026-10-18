import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { saveMedicine } from '../../database/database';
import { FrequencyType, Medicine, MedicineSchedule, TimeOfDay } from '../../types/medicine';
import { scheduleAllMedicineNotifications } from '../../services/notifications';
import { PrimaryButton } from '../../components/PrimaryButton';
import { syncWithCloud } from '../../services/sync';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function AddMedicineScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [instructions, setInstructions] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [selectedPreset, setSelectedPreset] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [saving, setSaving] = useState(false);

  const timePresets = [
    { key: 'morning', label: t('morning', 'Morning'), time: '09:00', icon: 'sunny', color: '#F59E0B' },
    { key: 'afternoon', label: t('afternoon', 'Afternoon'), time: '13:00', icon: 'partly-sunny', color: '#3B82F6' },
    { key: 'evening', label: t('evening', 'Evening'), time: '18:00', icon: 'cloudy-night', color: '#8B5CF6' },
    { key: 'night', label: t('night', 'Night'), time: '21:00', icon: 'moon', color: '#6366F1' },
  ];

  const handleSelectPreset = (preset: any) => {
    setSelectedPreset(preset.key);
    setScheduledTime(preset.time);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('required_fields', 'Required Field'), t('enter_med_name', 'Please enter the medicine name (e.g. Lisinopril).'));
      return;
    }
    if (!dose.trim()) {
      Alert.alert(t('required_fields', 'Required Field'), t('enter_med_dose', 'Please enter the dosage (e.g. 10 mg or 1 tablet).'));
      return;
    }

    setSaving(true);
    try {
      const medId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];

      const scheduleId = `sched_${Date.now()}`;
      const schedule: MedicineSchedule = {
        id: scheduleId,
        medicineId: medId,
        scheduledTime,
        timeOfDay: selectedPreset as TimeOfDay,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      const newMedicine: Medicine = {
        id: medId,
        name: name.trim(),
        dose: dose.trim(),
        instructions: instructions.trim() || null,
        frequency,
        startDate: todayStr,
        active: true,
        schedules: [schedule],
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      };

      await saveMedicine(newMedicine);
      try {
        await scheduleAllMedicineNotifications();
      } catch (notifErr) {
        console.warn('Notification scheduling error ignored:', notifErr);
      }
      syncWithCloud().catch(() => {});

      router.back();
    } catch (e) {
      console.error('Failed to save medicine:', e);
      Alert.alert(t('error', 'Error'), t('save_med_error', 'Failed to save medicine schedule.'));
    } finally {
      setSaving(false);
    }
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
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { fontSize: fs(18) }]} numberOfLines={1}>
            {t('add_medicine', 'Add Medicine')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Banner with Mascot */}
          <View style={[styles.mascotBanner, Shadows.sm]}>
            <BPMascot size={54} mood="medicine" />
            <View style={styles.mascotBannerText}>
              <Text style={styles.mascotBannerTitle}>
                {t('med_reminder_banner', 'Medicine Reminder')}
              </Text>
              <Text style={styles.mascotBannerSub}>
                {t('med_reminder_banner_sub', 'Set up recurring clock times to receive reliable local device alerts.')}
              </Text>
            </View>
          </View>

          {/* Medicine Name Card */}
          <View style={[styles.fieldCard, Shadows.card]}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name="pill" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.fieldTitle}>{t('medicine_name', 'Medicine Name')}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lisinopril, Amlodipine"
              placeholderTextColor="#A0AEC0"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Dose Card */}
          <View style={[styles.fieldCard, Shadows.card]}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="document-text-outline" size={18} color={Colors.amberDark} />
              </View>
              <Text style={styles.fieldTitle}>{t('dosage', 'Dosage')}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10 mg, 1 tablet, 5 ml"
              placeholderTextColor="#A0AEC0"
              value={dose}
              onChangeText={setDose}
            />
          </View>

          {/* Time & Preset Card */}
          <View style={[styles.fieldCard, Shadows.card]}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.purpleLight }]}>
                <Ionicons name="time-outline" size={18} color={Colors.purple} />
              </View>
              <Text style={styles.fieldTitle}>{t('time_of_day', 'Scheduled Time')}</Text>
            </View>

            {/* Time Preset Chips */}
            <View style={styles.presetChipsRow}>
              {timePresets.map((p) => {
                const isSelected = selectedPreset === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}
                    onPress={() => handleSelectPreset(p)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={p.icon as any}
                      size={14}
                      color={isSelected ? '#FFFFFF' : p.color}
                    />
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.input}
              placeholder="09:00"
              placeholderTextColor="#A0AEC0"
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />
            <Text style={styles.helperText}>
              {t('clock_helper_text', '24-hour clock format (e.g. 09:00 for 9 AM, 20:00 for 8 PM)')}
            </Text>
          </View>

          {/* Frequency Card */}
          <View style={[styles.fieldCard, Shadows.card]}>
            <View style={styles.fieldHeader}>
              <View style={[styles.iconCircle, { backgroundColor: Colors.mintLight }]}>
                <Ionicons name="calendar-outline" size={18} color={Colors.mintDark} />
              </View>
              <Text style={styles.fieldTitle}>{t('frequency', 'Frequency')}</Text>
            </View>
            <View style={styles.frequencyPickerRow}>
              {(['daily', 'twice_daily', 'specific_days'] as FrequencyType[]).map((f) => {
                const isSelected = frequency === f;
                const labels: Record<string, string> = {
                  daily: t('freq_once', 'Daily'),
                  twice_daily: t('freq_twice', 'Twice Daily'),
                  specific_days: t('freq_custom_days', 'Custom Days'),
                };
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.freqButton,
                      isSelected && styles.freqButtonActive,
                    ]}
                    onPress={() => setFrequency(f)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.freqButtonText,
                        isSelected && styles.freqButtonTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {labels[f]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Instructions / Notes Card */}
          <View style={[styles.fieldCard, Shadows.card]}>
            <Text style={styles.fieldTitleSimple}>
              {t('instructions', 'Instructions (optional)')}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Take with water after breakfast"
              placeholderTextColor="#A0AEC0"
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          {/* Big Blue Save Button */}
          <PrimaryButton
            title={t('save_med_schedule', 'Save Medicine Schedule')}
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  mascotBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mascotBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  mascotBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  mascotBannerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fieldTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  fieldTitleSimple: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  frequencyPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqButton: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  freqButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  freqButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  freqButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 10,
  },
});
