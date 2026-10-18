import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { getReadingById, saveReading, deleteReading } from '../../database/database';
import { BloodPressureReading } from '../../types/reading';
import { classifyBloodPressure, formatReadingDateTime } from '../../utils/bpClassification';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';
import { useLanguage } from '../../context/LanguageContext';

export default function ReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { fs } = useResponsive();

  const [reading, setReading] = useState<BloodPressureReading | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReading() {
      if (!id) return;
      const data = await getReadingById(id);
      if (data) {
        setReading(data);
        setSystolic(data.systolic.toString());
        setDiastolic(data.diastolic.toString());
        setPulse(data.pulse ? data.pulse.toString() : '');
        setNotes(data.notes || '');
      }
      setLoading(false);
    }
    fetchReading();
  }, [id]);

  const handleUpdate = async () => {
    const sysNum = parseInt(systolic, 10);
    const diaNum = parseInt(diastolic, 10);

    if (!sysNum || !diaNum || sysNum < 40 || diaNum < 30) {
      Alert.alert(t('check_values', 'Check Values'), t('invalid_reading_values', 'Please enter valid systolic and diastolic values.'));
      return;
    }

    if (!reading) return;

    const updated: BloodPressureReading = {
      ...reading,
      systolic: sysNum,
      diastolic: diaNum,
      pulse: pulse ? parseInt(pulse, 10) : null,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    await saveReading(updated);
    setReading(updated);
    setIsEditing(false);
    Alert.alert(t('success', 'Saved'), t('reading_saved', 'Measurement updated successfully.'));
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete_reading_title', 'Delete Reading'),
      t('delete_reading_confirm', 'Are you sure you want to delete this measurement? This action cannot be undone.'),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteReading(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading || !reading) {
    return (
      <ScreenContainer style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('reading_details_title', 'Reading Details')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <BPMascot size={64} mood="curious" />
          <Text style={styles.loadingText}>{t('no_readings_period', 'Reading not found')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const classification = classifyBloodPressure(reading.systolic, reading.diastolic, t);

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { fontSize: fs(18) }]} numberOfLines={1}>
          {isEditing ? t('edit_reading_title', 'Edit Reading') : t('reading_details_title', 'Reading Details')}
        </Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.backButton}
        >
          <Ionicons
            name={isEditing ? 'close' : 'create-outline'}
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isEditing ? (
          <View>
            <View style={[styles.card, Shadows.card]}>
              <Text style={styles.fieldLabel}>{t('systolic_label', 'Systolic (top number)')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={systolic}
                onChangeText={setSystolic}
                maxLength={3}
              />

              <Text style={styles.fieldLabel}>{t('diastolic_label', 'Diastolic (bottom number)')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={diastolic}
                onChangeText={setDiastolic}
                maxLength={3}
              />

              <Text style={styles.fieldLabel}>{t('pulse_label', 'Pulse (bpm)')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={pulse}
                onChangeText={setPulse}
                maxLength={3}
              />

              <Text style={styles.fieldLabel}>{t('notes_optional', 'Notes (Optional)')}</Text>
              <TextInput
                style={[styles.input, { height: 74 }]}
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <PrimaryButton title={t('save_changes', 'Save Changes')} onPress={handleUpdate} />
          </View>
        ) : (
          <View>
            {/* Hero Reading Card */}
            <View style={[styles.mainCard, Shadows.card]}>
              <Text style={styles.timestampText}>
                {formatReadingDateTime(reading.measuredAt, language)}
              </Text>

              <View style={styles.readingHero}>
                <Text
                  style={styles.heroNumber}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {reading.systolic} / {reading.diastolic}
                </Text>
                <Text style={styles.heroUnit}>{t('mmhg', 'mmHg')}</Text>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: classification.bgColor,
                    borderColor: classification.color + '40',
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: classification.color }]}>
                  {classification.badgeLabel}
                </Text>
              </View>

              {reading.pulse ? (
                <View style={styles.pulseRow}>
                  <Ionicons name="heart" size={20} color={Colors.heartPulseRed} />
                  <Text style={styles.pulseText}>{reading.pulse} {t('pulse_bpm', 'bpm')}</Text>
                </View>
              ) : null}
            </View>

            {/* Clinical Guidance Box */}
            <View style={[styles.guidanceCard, Shadows.card]}>
              <View style={styles.guidanceHeader}>
                <BPMascot size={38} mood={classification.isConcerning ? 'curious' : 'happy'} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.guidanceTitle}>{t('measurement_details', 'Clinical Assessment')}</Text>
                  <Text style={styles.guidanceCategory}>{classification.label}</Text>
                </View>
              </View>

              <Text style={styles.guidanceDesc}>{classification.description}</Text>
              {classification.actionGuidance && (
                <Text style={styles.guidanceAction}>
                  {classification.actionGuidance}
                </Text>
              )}
            </View>

            {/* Notes if available */}
            {reading.notes && (
              <View style={[styles.guidanceCard, Shadows.card]}>
                <Text style={styles.guidanceTitle}>{t('notes_optional', 'Notes')}</Text>
                <Text style={styles.notesText}>{reading.notes}</Text>
              </View>
            )}

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              <Text style={styles.deleteText}>{t('delete_reading_title', 'Delete Reading')}</Text>
            </TouchableOpacity>
          </View>
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  timestampText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  readingHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  heroNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginBottom: 14,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  pulseText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  guidanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  guidanceCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  guidanceDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  guidanceAction: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 8,
    lineHeight: 16,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dangerLight,
    marginTop: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  deleteText: {
    color: Colors.dangerDark,
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
