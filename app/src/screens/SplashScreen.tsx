import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { CulturalBand } from '../components/common/CulturalBand';
import { Button } from '../components/common/Button';
import { useTranslation } from '../i18n';

interface SplashScreenProps {
  onFinish: () => void;
  hasError?: boolean;
  onRetry?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  hasError = false,
  onRetry,
}) => {
  const { t } = useTranslation();

  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const seed1Translate = useRef(new Animated.Value(-10)).current;
  const seed1Opacity = useRef(new Animated.Value(0)).current;
  const seed2Translate = useRef(new Animated.Value(-10)).current;
  const seed2Opacity = useRef(new Animated.Value(0)).current;
  const seed3Translate = useRef(new Animated.Value(-10)).current;
  const seed3Opacity = useRef(new Animated.Value(0)).current;
  const bandOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasError) return;

    // Entrance animation choreography
    Animated.sequence([
      // 1. Logo roundel enters (120ms)
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      // 2. Three seeds settle one by one (120ms apart)
      Animated.stagger(120, [
        Animated.parallel([
          Animated.timing(seed1Translate, { toValue: 0, duration: 200, easing: Easing.out(Easing.bounce), useNativeDriver: true }),
          Animated.timing(seed1Opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(seed2Translate, { toValue: 0, duration: 200, easing: Easing.out(Easing.bounce), useNativeDriver: true }),
          Animated.timing(seed2Opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(seed3Translate, { toValue: 0, duration: 200, easing: Easing.out(Easing.bounce), useNativeDriver: true }),
          Animated.timing(seed3Opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
      ]),
      // 3. Cultural band fades in
      Animated.timing(bandOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    // Minimum 1.2s hold, max 2.0s handoff
    const timer = setTimeout(() => {
      onFinish();
    }, 1600);

    return () => clearTimeout(timer);
  }, [onFinish, hasError, logoScale, logoOpacity, seed1Translate, seed1Opacity, seed2Translate, seed2Opacity, seed3Translate, seed3Opacity, bandOpacity]);

  return (
    <View style={styles.container} accessibilityRole="summary" accessibilityLabel="Gebeta / ገበጣ Splash Screen">
      <View style={styles.content}>
        {/* Logo Roundel */}
        <Animated.View
          style={[
            styles.logoRoundel,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Seed stones resting in shallow arc */}
          <View style={styles.seedsContainer}>
            <Animated.View
              style={[
                styles.seedStone,
                styles.seedIvory,
                {
                  opacity: seed1Opacity,
                  transform: [{ translateY: seed1Translate }],
                },
              ]}
            >
              <View style={styles.seedHighlight} />
            </Animated.View>
            <Animated.View
              style={[
                styles.seedStone,
                styles.seedSand,
                {
                  opacity: seed2Opacity,
                  transform: [{ translateY: seed2Translate }],
                },
              ]}
            >
              <View style={styles.seedHighlight} />
            </Animated.View>
            <Animated.View
              style={[
                styles.seedStone,
                styles.seedClay,
                {
                  opacity: seed3Opacity,
                  transform: [{ translateY: seed3Translate }],
                },
              ]}
            >
              <View style={styles.seedHighlight} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.title} accessibilityRole="header">
          {t('splash.title')}
        </Text>

        {/* Cultural Band */}
        <Animated.View style={[styles.bandWrapper, { opacity: bandOpacity }]}>
          <CulturalBand style={styles.culturalBand} />
        </Animated.View>
      </View>

      {/* Tagline or Error / Retry Zone */}
      <View style={styles.footer}>
        {hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('common.error')}</Text>
            {onRetry && (
              <Button
                title={t('common.retry')}
                onPress={onRetry}
                variant="secondary"
                style={styles.retryButton}
              />
            )}
          </View>
        ) : (
          <Text style={styles.tagline}>
            {t('splash.tagline')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.space8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.space5,
    marginTop: -32, // Optical adjustment
  },
  logoRoundel: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.woodMid,
    borderWidth: 2,
    borderColor: colors.woodDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.woodDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: spacing.space5,
  },
  seedsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '80%',
    gap: 8,
  },
  seedStone: {
    width: 20,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  seedIvory: {
    backgroundColor: colors.seedIvory,
  },
  seedSand: {
    backgroundColor: colors.seedSand,
  },
  seedClay: {
    backgroundColor: colors.seedClay,
  },
  seedHighlight: {
    position: 'absolute',
    top: 2,
    left: 3,
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: 24,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.space4,
    letterSpacing: 0.5,
  },
  bandWrapper: {
    width: 160,
    alignItems: 'center',
  },
  culturalBand: {
    width: 160,
    height: 10,
    borderRadius: radius.radiusSm,
    opacity: 0.85,
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing.space6,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    marginBottom: spacing.space4,
  },
  tagline: {
    fontSize: 15,
    fontFamily: typography.fontFamily.primary,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
    gap: spacing.space3,
  },
  errorText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.primary,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    width: 200,
    height: 48,
  },
});
