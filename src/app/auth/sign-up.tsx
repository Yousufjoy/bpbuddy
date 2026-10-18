import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { migrateGuestDataToUser } from '../../services/sync';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BPMascot } from '../../components/BPMascot';
import { useLanguage } from '../../context/LanguageContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { fs, isCompact, isTablet } = useResponsive();
  const mascotSize = isCompact ? 64 : isTablet ? 88 : 80;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('required_fields', 'Required Fields'), t('check_values', 'Please enter your email and password.'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('check_values', 'Check Values'), t('password_too_short', 'Password must be at least 6 characters long.'));
      return;
    }

    if (!isSupabaseConfigured()) {
      Alert.alert(
        t('guest_mode', 'Offline / Guest Mode'),
        t('offline_guest_msg', 'Supabase cloud credentials are not yet configured in this environment. You can continue using BP Buddy offline with local SQLite storage!')
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || 'BP Buddy User',
          },
        },
      });

      if (error) {
        Alert.alert(t('error', 'Error'), error.message);
        return;
      }

      if (data.user) {
        await migrateGuestDataToUser(data.user.id);
        Alert.alert(t('account_created', 'Account Created!'), t('account_created_sub', 'Your account has been created and local data linked.'));
        router.back();
      }
    } catch (err: any) {
      Alert.alert(t('error', 'Error'), err?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
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
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { fontSize: fs(17) }]} numberOfLines={1}>{t('sign_up_title', 'Create Account')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot Hero */}
          <View style={styles.brandHero}>
            <BPMascot size={mascotSize} mood="celebrating" />
            <Text style={[styles.heroTitle, { fontSize: fs(22) }]}>{t('sign_up_hero', 'Join BP Buddy')}</Text>
            <Text style={styles.heroSub}>
              {t('sign_up_hero_sub', 'Safely synchronize your cardiovascular measurements, doctor reports, and medicine reminders anywhere.')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, Shadows.card]}>
            <Text style={styles.fieldLabel}>{t('your_name', 'Your Name')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex Taylor"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t('email_address', 'Email Address')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t('password_min', 'Password (min 6 characters)')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <PrimaryButton
              title={t('sign_up_btn', 'Create BP Buddy Account')}
              icon={<Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />}
              onPress={handleSignUp}
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>

          {/* Switch to Sign In */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('already_have_account', 'Already have an account? ')}</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
              <Text style={styles.footerLink}>{t('sign_in_title', 'Sign In')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>{t('continue_guest', 'Stay in Guest Mode (Offline)')}</Text>
          </TouchableOpacity>
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
  brandHero: {
    alignItems: 'center',
    marginVertical: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 12,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  guestButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },
  guestButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
