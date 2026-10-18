import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';
import { BPMascot } from './BPMascot';
import { PrimaryButton } from './PrimaryButton';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  isFirstLaunch?: boolean;
  onConfirm?: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
  isFirstLaunch = false,
  onConfirm,
}) => {
  const { language, setLanguage, languagesList, t } = useLanguage();

  const handleSelect = async (code: SupportedLanguage) => {
    await setLanguage(code);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={isFirstLaunch ? undefined : onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalCard, Shadows.hero]}>
              {/* Header Icon / Mascot */}
              <View style={styles.mascotRow}>
                <BPMascot size={52} mood="happy" />
              </View>

              <Text style={styles.modalTitle}>
                {t('choose_language_title', 'Choose Your Language')}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t('choose_language_sub', 'Select your preferred language to begin with BP Buddy.')}
              </Text>

              {/* Language Options List */}
              <ScrollView
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              >
                {languagesList.map((item) => {
                  const isSelected = item.code === language;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                      ]}
                      onPress={() => handleSelect(item.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLeft}>
                        <Text style={styles.flagText}>{item.flag}</Text>
                        <View style={styles.namesWrap}>
                          <Text
                            style={[
                              styles.nativeNameText,
                              isSelected && styles.selectedText,
                            ]}
                          >
                            {item.nativeName}
                          </Text>
                          <Text style={styles.englishNameText}>
                            {item.name}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Confirm / Continue Button */}
              <View style={styles.buttonWrap}>
                <PrimaryButton
                  title={isFirstLaunch ? t('continue', 'Continue') : t('done', 'Done')}
                  onPress={handleConfirm}
                  style={styles.confirmButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 54, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    width: '100%',
    maxWidth: 380,
    padding: 22,
    alignItems: 'center',
  },
  mascotRow: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  optionsList: {
    width: '100%',
    maxHeight: 280,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    marginBottom: 8,
    backgroundColor: '#FBFDFF',
  },
  optionRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagText: {
    fontSize: 24,
  },
  namesWrap: {
    justifyContent: 'center',
  },
  nativeNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectedText: {
    color: Colors.primaryDark,
  },
  englishNameText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  buttonWrap: {
    width: '100%',
    marginTop: 12,
  },
  confirmButton: {
    width: '100%',
    height: 48,
  },
});
