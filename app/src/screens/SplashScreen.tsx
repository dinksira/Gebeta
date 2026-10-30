import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { CulturalBand } from '../components/common/CulturalBand';
import { useTranslation } from '../i18n';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('splash.title')}</Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
      </View>
      <CulturalBand style={styles.band} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space5,
  },
  title: {
    fontSize: 48,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.woodDark,
    marginBottom: spacing.space2,
  },
  tagline: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  band: {
    width: '100%',
  },
});
