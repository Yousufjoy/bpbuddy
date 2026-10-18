import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { exportDataAsJson, exportReadingsAsCsv, restoreFromJson } from '../../services/backup';
import { syncWithCloud } from '../../services/sync';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function BackupScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();

  const [syncing, setSyncing] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [restoring, setRestoring] = useState(false);

  const handleSyncCloud = async () => {
    setSyncing(true);
    try {
      const res = await syncWithCloud();
      Alert.alert(res.success ? t('sync_successful', 'Sync Successful') : t('notice', 'Notice'), res.message);
    } catch (e: any) {
      Alert.alert(t('sync_error', 'Sync Error'), e?.message || 'Failed to sync with Supabase.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportJson = async () => {
    try {
      const json = await exportDataAsJson();
      Alert.alert(
        t('json_backup_title', 'JSON Backup Generated'),
        `Backup contains valid schema data with ${json.length} characters.\n\nYou can restore this data anytime.`,
        [
          { text: t('done', 'Done'), style: 'cancel' },
          {
            text: 'View Raw JSON',
            onPress: () => {
              setJsonInput(json);
              setShowRestoreModal(true);
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(t('export_failed', 'Export Failed'), e?.message || 'Could not export JSON.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const csv = await exportReadingsAsCsv();
      Alert.alert(
        t('csv_backup_title', 'CSV Export Generated'),
        `Blood pressure readings exported as CSV table:\n\n${csv.split('\n').slice(0, 4).join('\n')}\n...`,
        [{ text: t('done', 'Close') }]
      );
    } catch (e: any) {
      Alert.alert(t('export_failed', 'Export Failed'), e?.message || 'Could not export CSV.');
    }
  };

  const handlePerformRestore = async () => {
    if (!jsonInput.trim()) {
      Alert.alert(t('empty_input', 'Empty Input'), t('paste_json_prompt', 'Please paste the JSON backup content.'));
      return;
    }

    setRestoring(true);
    try {
      const result = await restoreFromJson(jsonInput);
      Alert.alert(
        t('restore_complete', 'Restore Complete'),
        `Successfully restored:\n• ${result.readingsCount} blood pressure readings\n• ${result.medicinesCount} medicines\n• ${result.logsCount} dose logs`
      );
      setShowRestoreModal(false);
      setJsonInput('');
    } catch (e: any) {
      Alert.alert(t('restore_failed', 'Restore Failed'), e?.message || 'Invalid backup data.');
    } finally {
      setRestoring(false);
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
          {t('backup_title', 'Data Backup & Export')}
        </Text>
        <View style={styles.mascotChip}>
          <BPMascot size={32} mood="curious" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cloud Sync Hero Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="cloud-upload" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('enable_cloud_sync', 'Cloud Synchronization')}</Text>
              <Text style={styles.cardSubtitle}>
                {t('enable_cloud_sub', 'Sync seamlessly with Supabase PostgreSQL cloud storage')}
              </Text>
            </View>
          </View>

          <PrimaryButton
            title={t('enable_cloud_sync', 'Sync Database Now')}
            icon={<Ionicons name="sync-outline" size={18} color="#FFFFFF" />}
            onPress={handleSyncCloud}
            loading={syncing}
            style={{ marginTop: 14 }}
          />
        </View>

        {/* Local File Export */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.sectionTitle}>{t('backup_title', 'Portable Data Export')}</Text>
          <Text style={styles.sectionDesc}>
            {t('backup_desc', 'Download full records to standard formats for offline archives or sharing with medical specialists.')}
          </Text>

          <TouchableOpacity
            style={styles.exportRow}
            onPress={handleExportJson}
            activeOpacity={0.7}
          >
            <View style={styles.exportRowLeft}>
              <View style={[styles.miniIconCircle, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="code-download-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.exportTextWrap}>
                <Text style={styles.exportTitle}>{t('export_json', 'Export Full JSON Backup')}</Text>
                <Text style={styles.exportSub}>{t('backup_sub', 'All readings, medicines & dose history')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportRow, { borderBottomWidth: 0 }]}
            onPress={handleExportCsv}
            activeOpacity={0.7}
          >
            <View style={styles.exportRowLeft}>
              <View style={[styles.miniIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="grid-outline" size={20} color={Colors.success} />
              </View>
              <View style={styles.exportTextWrap}>
                <Text style={styles.exportTitle}>{t('export_csv', 'Export CSV Table')}</Text>
                <Text style={styles.exportSub}>{t('backup_desc', 'Spreadsheet format for Excel, Google Sheets')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Restore Section */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.sectionTitle}>{t('import_backup', 'Restore Data')}</Text>
          <Text style={styles.sectionDesc}>
            {t('backup_desc', 'Import data from a previous BP Buddy JSON backup file safely without overwriting recent measurements.')}
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => setShowRestoreModal(!showRestoreModal)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
            <Text style={styles.restoreButtonText}>
              {showRestoreModal ? t('cancel', 'Hide Restore Console') : t('import_backup', 'Open JSON Restore Console')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Restore Console Card */}
        {showRestoreModal && (
          <View style={[styles.restoreModalCard, Shadows.card]}>
            <View style={styles.restoreHeader}>
              <Text style={styles.modalTitle}>{t('import_backup', 'Paste JSON Backup Content')}</Text>
              <TouchableOpacity onPress={() => setShowRestoreModal(false)}>
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.jsonInput}
              multiline
              placeholder='Paste JSON here (e.g. {"app":"BP Buddy", ...})'
              placeholderTextColor={Colors.textMuted}
              value={jsonInput}
              onChangeText={setJsonInput}
            />
            <PrimaryButton
              title={t('import_backup', 'Validate & Restore Database')}
              icon={<Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />}
              onPress={handlePerformRestore}
              loading={restoring}
            />
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  exportRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  exportTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  miniIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exportSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  restoreModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginTop: 2,
    marginBottom: 20,
  },
  restoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  jsonInput: {
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    height: 120,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
});
