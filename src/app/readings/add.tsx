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
import { saveReading } from '../../database/database';
import { classifyBloodPressure, formatReadingDateTime } from '../../utils/bpClassification';
import { PrimaryButton } from '../../components/PrimaryButton';
import { syncWithCloud } from '../../services/sync';
import { BPMascot } from '../../components/BPMascot';
import { useLanguage } from '../../context/LanguageContext';

export default function AddReadingScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { fs } = useResponsive();

  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const sysNum = parseInt(systolic, 10);
  const diaNum = parseInt(diastolic, 10);
  const hasValues = !isNaN(sysNum) && !isNaN(diaNum) && sysNum > 0 && diaNum > 0;
  const classification = hasValues ? classifyBloodPressure(sysNum, diaNum, t) : null;

  const handleAdjustValue = (type: 'sys' | 'dia' | 'pulse', delta: number) => {
    if (type === 'sys') {
      const cur = parseInt(systolic, 10) || 120;
      setSystolic(Math.max(40, Math.min(260, cur + delta)).toString());
    } else if (type === 'dia') {
      const cur = parseInt(diastolic, 10) || 80;
      setDiastolic(Math.max(30, Math.min(180, cur + delta)).toString());
    } else {
      const cur = parseInt(pulse, 10) || 72;
      setPulse(Math.max(30, Math.min(220, cur + delta)).toString());
    }
  };

  const handleSave = async () => {
    if (!systolic || !diastolic) {
      Alert.alert(t('required_fields', 'Required Fields'), t('required_fields', 'Please enter both systolic and diastolic numbers.'));
      return;
    }

    if (sysNum < 40 || sysNum > 300 || diaNum < 30 || diaNum > 200) {
      Alert.alert(
        t('check_values', 'Check Values'),
        t('invalid_reading_values', 'Please enter realistic blood pressure values (Systolic 40-300, Diastolic 30-200).')
      );
      return;
    }

    setSaving(true);
    try {
      const readingId = `reading_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      await saveReading({
        id: readingId,
        systolic: sysNum,
        diastolic: diaNum,
        pulse: pulse ? parseInt(pulse, 10) : null,
        measuredAt,
        notes: notes.trim() || null,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      });

      syncWithCloud().catch(() => {});
      router.back();
    } catch (error) {
      console.error('Failed to save reading:', error);
      Alert.alert(t('error', 'Error'), t('error', 'Failed to save measurement. Please try again.'));
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
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { fontSize: fs(18) }]} numberOfLines={1}>
            {t('add_reading_title', 'Add Reading')}
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
            <BPMascot size={54} mood="curious" />
            <View style={styles.mascotBannerText}>
              <Text style={styles.mascotBannerTitle}>
                {t('record_bp_banner', 'Record Blood Pressure')}
              </Text>
              <Text style={styles.mascotBannerSub}>
                {t('record_bp_banner_sub', 'Rest 5 minutes quietly before reading for optimal accuracy.')}
              </Text>
            </View>
          </View>

          {/* Systolic Card */}
          <View style={[styles.inputCard, styles.sysCard, Shadows.card]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circleIcon, { backgroundColor: Colors.coralLight }]}>
                <Ionicons name="pencil" size={18} color={Colors.coral} />
              </View>
              <Text style={styles.inputLabel}>{t('systolic_label', 'Systolic (top number)')}</Text>
            </View>

            <View style={styles.numberInputRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustValue('sys', -1)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>

              <TextInput
                style={[styles.bigNumberInput, { color: Colors.coralDark }]}
                keyboardType="numeric"
                placeholder="120"
                placeholderTextColor="#A0AEC0"
                value={systolic}
                onChangeText={setSystolic}
                maxLength={3}
              />
              <Text style={styles.unitSuffix}>mmHg</Text>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustValue('sys', 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Diastolic Card */}
          <View style={[styles.inputCard, styles.diaCard, Shadows.card]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circleIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name="speedometer" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.inputLabel}>{t('diastolic_label', 'Diastolic (bottom number)')}</Text>
            </View>

            <View style={styles.numberInputRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustValue('dia', -1)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>

              <TextInput
                style={[styles.bigNumberInput, { color: Colors.primary }]}
                keyboardType="numeric"
                placeholder="80"
                placeholderTextColor="#A0AEC0"
                value={diastolic}
                onChangeText={setDiastolic}
                maxLength={3}
              />
              <Text style={styles.unitSuffix}>mmHg</Text>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustValue('dia', 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pulse Card */}
          <View style={[styles.inputCard, styles.pulseCard, Shadows.card]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circleIcon, { backgroundColor: Colors.mintLight }]}>
                <Ionicons name="heart" size={18} color={Colors.mint} />
              </View>
              <Text style={styles.inputLabel}>{t('pulse_label', 'Pulse (heart rate)')}</Text>
            </View>

            <View style={styles.numberInputRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustValue('pulse', -1)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>

              <TextInput
                style={[styles.bigNumberInput, { color: Colors.mintDark }]}
                keyboardType="numeric"
                placeholder="72"
                placeholderTextColor="#A0AEC0"
                value={pulse}
                onChangeText={setPulse}
                maxLength={3}
              />
              <Text style={styles.unitSuffix}>{t('pulse_bpm', 'bpm')}</Text>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustValue('pulse', 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Live Dynamic Classification Preview */}
          {classification && (
            <View
              style={[
                styles.liveClassification,
                { backgroundColor: classification.bgColor, borderColor: classification.color + '40' },
              ]}
            >
              <View style={styles.badgeHeader}>
                <View
                  style={[
                    styles.classificationBadge,
                    { backgroundColor: classification.color },
                  ]}
                >
                  <Text style={styles.classificationBadgeText}>
                    {classification.badgeLabel}
                  </Text>
                </View>
                <Text style={styles.classificationCategoryLabel}>
                  {classification.label}
                </Text>
              </View>

              <Text style={styles.classificationDesc}>
                {classification.description}
              </Text>

              {classification.actionGuidance && (
                <Text style={styles.classificationAction}>
                  {classification.actionGuidance}
                </Text>
              )}
            </View>
          )}

          {/* Date & Time Selector */}
          <Text style={styles.subSectionHeader}>{t('date_time', 'Date & Time')}</Text>
          <TouchableOpacity
            style={[styles.dateTimeCard, Shadows.card]}
            onPress={() => {
              setMeasuredAt(new Date().toISOString());
            }}
            activeOpacity={0.8}
          >
            <View style={styles.dateTimeLeft}>
              <View style={[styles.circleIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.dateTimeText}>
                {formatReadingDateTime(measuredAt, language)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Notes Card */}
          <View style={[styles.notesCard, Shadows.card]}>
            <TextInput
              style={styles.notesInput}
              placeholder={t('notes_placeholder', 'Add context (e.g. after morning coffee, feeling tired)')}
              placeholderTextColor="#A0AEC0"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Big Blue Save Button */}
          <PrimaryButton
            title={t('save_measurement', 'Save Measurement')}
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
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sysCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.coral,
  },
  diaCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  pulseCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.mint,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  bigNumberInput: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.textPrimary,
    minWidth: 72,
    textAlign: 'center',
    padding: 0,
    letterSpacing: -1,
  },
  unitSuffix: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  liveClassification: {
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  classificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  classificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  classificationCategoryLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  classificationDesc: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  classificationAction: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  subSectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  dateTimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  dateTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  notesInput: {
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 44,
  },
  saveButton: {
    marginTop: 4,
  },
});
