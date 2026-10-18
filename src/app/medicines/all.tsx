import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { getAllMedicines, deleteMedicine, saveMedicine } from '../../database/database';
import { Medicine } from '../../types/medicine';
import { PrimaryButton } from '../../components/PrimaryButton';
import { scheduleAllMedicineNotifications } from '../../services/notifications';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function MyMedicinesScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedicines = async () => {
    try {
      const list = await getAllMedicines(true);
      setMedicines(list);
    } catch (e) {
      console.warn('Failed to load medicines:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicines();
    setRefreshing(false);
  };

  const handleToggleActive = async (med: Medicine) => {
    const updated: Medicine = {
      ...med,
      active: !med.active,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    await saveMedicine(updated);
    try {
      await scheduleAllMedicineNotifications();
    } catch (notifErr) {
      console.warn('Notification scheduling error ignored:', notifErr);
    }
    setMedicines((prev) => prev.map((m) => (m.id === med.id ? updated : m)));
  };

  const handleDelete = (med: Medicine) => {
    Alert.alert(
      t('delete_med_title', 'Delete Medicine'),
      t('delete_med_prompt', `Are you sure you want to delete ${med.name}? Reminders will be canceled. Historical dose logs will remain safe.`),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteMedicine(med.id);
            try {
              await scheduleAllMedicineNotifications();
            } catch (notifErr) {
              console.warn('Notification scheduling error ignored:', notifErr);
            }
            loadMedicines();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { fontSize: fs(18) }]} numberOfLines={1}>
          {t('my_meds', 'My Medicines')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Prominent Add Medicine Button */}
        <PrimaryButton
          title={t('add_medicine', 'Add Medicine')}
          icon={<Ionicons name="add" size={22} color="#FFFFFF" />}
          onPress={() => router.push('/medicines/add')}
          style={styles.addButton}
        />

        {/* Medicine List */}
        {medicines.length === 0 ? (
          <View style={[styles.emptyContainer, Shadows.card]}>
            <BPMascot size={64} mood="curious" />
            <Text style={styles.emptyTitle}>{t('no_meds_title', 'No medicines configured')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('no_meds_sub', 'Add your prescribed medications to receive on-time reminders and track daily doses.')}
            </Text>
          </View>
        ) : (
          medicines.map((med, index) => {
            const isFirst = index % 2 === 0;
            const primarySchedule = med.schedules && med.schedules[0];
            const scheduleTimeStr = primarySchedule
              ? `${primarySchedule.scheduledTime}`
              : t('freq_once', 'Daily');

            return (
              <View
                key={med.id}
                style={[
                  styles.medicineCard,
                  Shadows.card,
                  !med.active && styles.medicineCardInactive,
                ]}
              >
                {/* Medicine Icon */}
                <View
                  style={[
                    styles.medIconCircle,
                    {
                      backgroundColor: isFirst
                        ? Colors.coralLight
                        : Colors.primaryLight,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="pill"
                    size={22}
                    color={isFirst ? Colors.coral : Colors.primary}
                  />
                </View>

                {/* Details */}
                <TouchableOpacity
                  style={styles.medDetailsArea}
                  onPress={() => router.push(`/medicines/${med.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.nameRow}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <View style={styles.dosePill}>
                      <Text style={styles.dosePillText}>{med.dose}</Text>
                    </View>
                  </View>

                  <Text style={styles.medSubtitle}>
                    {med.instructions || '1 tablet'} • {scheduleTimeStr}
                  </Text>
                </TouchableOpacity>

                {/* Actions: Pause/Resume Toggle & Delete */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggle,
                      med.active ? styles.statusToggleActive : styles.statusToggleInactive,
                    ]}
                    onPress={() => handleToggleActive(med)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={med.active ? 'checkmark' : 'pause'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={() => handleDelete(med)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Doctor Advice Banner with Mascot */}
        <View style={[styles.adviceBanner, Shadows.card]}>
          <BPMascot size={46} mood="encouraging" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.adviceTitle}>{t('medical_notice_title', 'Clinician Guidance')}</Text>
            <Text style={styles.adviceText}>
              {t('medical_notice_body', 'Always take your medication exactly as prescribed by your licensed healthcare provider.')}
            </Text>
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
  addButton: {
    marginVertical: 12,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  medicineCardInactive: {
    opacity: 0.55,
  },
  medIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  medDetailsArea: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 3,
  },
  medName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  dosePill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dosePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  medSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  statusToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleActive: {
    backgroundColor: Colors.mint,
  },
  statusToggleInactive: {
    backgroundColor: '#94A3B8',
  },
  deleteIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  adviceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
