import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Button } from '../components/common/Button';
import { CulturalBand } from '../components/common/CulturalBand';
import { useTranslation } from '../i18n';

interface OnboardingScreenProps {
  onComplete: (username: string) => void;
}

const BLOCKED_WORDS = ['admin', 'moderator', 'system', 'root'];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Entrance animation: fade + slide up 12px
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 360, // motionSlow
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Autofocus 350ms after entrance
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  const validate = (name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length < 3) return 'onboarding.errorShort';
    if (trimmed.length > 16) return 'onboarding.errorLong';

    // Allow Latin letters, Ethiopic fidel, Arabic digits, and spaces (though spaces are trimmed or handled)
    // Regex for Latin letters, Ethiopic range (1200-137F), digits, spaces
    const validRegex = /^[\p{L}\p{N}\s]+$/u;
    if (!validRegex.test(trimmed)) {
      return 'onboarding.errorChars';
    }

    if (BLOCKED_WORDS.includes(trimmed.toLowerCase())) {
      return 'onboarding.errorBlocked';
    }

    return null;
  };

  const handleTextChange = (text: string) => {
    setUsername(text);
    const err = validate(text);
    setErrorKey(err);
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -2, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    const trimmed = username.trim();
    const err = validate(trimmed);
    if (err) {
      setErrorKey(err);
      triggerShake();
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 16) {
      setErrorKey(trimmed.length < 3 ? 'onboarding.errorShort' : 'onboarding.errorLong');
      triggerShake();
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      onComplete(trimmed);
    }, 400);
  };

  const trimmedLength = username.trim().length;
  const isInputValid = trimmedLength >= 3 && trimmedLength <= 16 && !errorKey;

  const getCounterColor = () => {
    if (trimmedLength >= 16) return colors.danger;
    if (trimmedLength >= 13) return colors.warning;
    return colors.textSecondary;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Decorative Board Illustration / Icon Header */}
        <View style={styles.illustrationContainer} accessibilityElementsHidden={true}>
          <View style={styles.boardMockup}>
            <View style={styles.pitIndicator} />
            <View style={styles.seedMockup} />
          </View>
          <CulturalBand style={styles.illustrationBand} />
        </View>

        {/* Title */}
        <Text style={styles.title} accessibilityRole="header">
          {t('onboarding.title')}
        </Text>

        {/* Helper (Stated before typing) */}
        <Text style={styles.helper}>
          {t('onboarding.helper')}
        </Text>

        {/* Hero Input Area with Shake Animation */}
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              transform: [{ translateX: shakeAnim }],
              borderColor: errorKey ? colors.danger : colors.border,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={t('onboarding.placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={handleTextChange}
            maxLength={20} // allow typing up to 20 to show warning/error properly
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!isSaving}
            accessibilityLabel="Username input"
          />
          <Text style={[styles.counter, { color: getCounterColor() }]}>
            {trimmedLength}/16
          </Text>
        </Animated.View>

        {/* Reserved 18px Validation Message Zone */}
        <View style={styles.messageZone}>
          {errorKey ? (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {t(errorKey)}
            </Text>
          ) : null}
        </View>
      </Animated.View>

      {/* Primary Button Pinned in Thumb Zone */}
      <View style={styles.footer}>
        <Button
          title={t('onboarding.start')}
          onPress={handleSubmit}
          variant="primary"
          disabled={!isInputValid || isSaving}
          loading={isSaving}
          style={styles.startButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.space5,
    paddingTop: spacing.space8,
    alignItems: 'flex-start',
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.space6,
  },
  boardMockup: {
    width: 96,
    height: 48,
    backgroundColor: colors.woodMid,
    borderRadius: radius.radiusMd,
    borderWidth: 2,
    borderColor: colors.woodDark,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.space3,
    marginBottom: spacing.space3,
    shadowColor: colors.woodDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pitIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.pitDeep,
  },
  seedMockup: {
    width: 14,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.seedSand,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  illustrationBand: {
    width: 120,
    height: 6,
    borderRadius: radius.radiusSm,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
    marginBottom: spacing.space2,
    letterSpacing: 0.3,
  },
  helper: {
    fontSize: 15,
    fontFamily: typography.fontFamily.primary,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.space6,
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderRadius: radius.radiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    marginBottom: spacing.space2,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: typography.fontFamily.primary,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  counter: {
    fontSize: 13,
    fontFamily: typography.fontFamily.primary,
    fontWeight: '600',
    marginLeft: spacing.space2,
  },
  messageZone: {
    height: 24,
    width: '100%',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.primary,
    color: colors.danger,
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing.space5,
    paddingBottom: spacing.space6,
    paddingTop: spacing.space3,
  },
  startButton: {
    width: '100%',
    height: 52,
  },
});
