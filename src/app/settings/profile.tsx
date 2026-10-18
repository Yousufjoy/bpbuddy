import React, { useEffect, useState } from 'react';
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
import { supabase } from '../../services/supabase';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';

import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { fs } = useResponsive();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch {
        setUser(null);
      }
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(t('sign_out', 'Sign Out'), t('sign_out_confirm', 'Are you sure you want to sign out?'), [
      { text: t('cancel', 'Cancel'), style: 'cancel' },
      {
        text: t('sign_out', 'Sign Out'),
        onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
          Alert.alert(t('signed_out_title', 'Signed Out'), t('signed_out_msg', 'You are now in guest mode. Your local database records remain safe and intact.'));
        },
      },
    ]);
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
          {t('profile_title', 'Profile & Account')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Hero Card with Mascot */}
        <View style={[styles.profileCard, Shadows.card]}>
          <View style={styles.avatarWrapper}>
            <BPMascot size={74} mood={user ? 'celebrating' : 'waving'} />
          </View>
          <Text style={styles.userName}>
            {user ? user.user_metadata?.full_name || 'BP Buddy Member' : t('guest_health_tracker', 'Guest Health Tracker')}
          </Text>
          <Text style={styles.userEmail}>
            {user ? user.email : t('local_device_active', 'Local device storage active')}
          </Text>

          <View style={[styles.modeBadge, { backgroundColor: user ? '#ECFDF5' : Colors.primaryLight }]}>
            <View style={[styles.badgeDot, { backgroundColor: user ? Colors.success : Colors.primary }]} />
            <Text style={[styles.modeBadgeText, { color: user ? Colors.success : Colors.primary }]}>
              {user ? t('cloud_sync_enabled', 'Cloud Synchronized') : t('guest_mode', 'Guest Mode (Offline-first)')}
            </Text>
          </View>
        </View>

        {/* Account Details or Sign In Card */}
        {!user ? (
          <View style={[styles.actionCard, Shadows.card]}>
            <View style={styles.actionHeader}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="cloud-done-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{t('enable_cloud_sync', 'Enable Cloud Sync')}</Text>
                <Text style={styles.actionDesc}>
                  {t('enable_cloud_sub', 'Sign in or create an account to back up your readings to Supabase PostgreSQL and access them across devices.')}
                </Text>
              </View>
            </View>

            <PrimaryButton
              title={t('sign_in_register', 'Sign In or Register')}
              icon={<Ionicons name="log-in-outline" size={18} color="#FFFFFF" />}
              onPress={() => router.push('/auth/sign-in')}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          <View style={[styles.actionCard, Shadows.card]}>
            <Text style={styles.sectionHeaderTitle}>{t('profile_title', 'Account Information')}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={styles.infoValue}>{user.id.substring(0, 14)}...</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={[styles.infoValue, { color: Colors.success }]}>
                {user.email_confirmed_at ? 'Verified' : 'Active'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
              <Text style={styles.signOutText}>{t('sign_out', 'Sign Out')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Data Architecture Note */}
        <View style={[styles.privacyCard, Shadows.card]}>
          <View style={styles.privacyTop}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.privacyTitle}>{t('offline_first_title', 'Offline-First Architecture')}</Text>
          </View>
          <Text style={styles.privacyText}>
            {t('offline_first_desc', 'BP Buddy stores all readings and medicine reminders locally on your device. When signed in, records sync securely without sharing your data with third parties.')}
          </Text>
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    flexGrow: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  actionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    marginTop: 18,
    gap: 8,
  },
  signOutText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  privacyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  privacyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
