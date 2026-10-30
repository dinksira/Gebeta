import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CulturalBand } from '../components/common/CulturalBand';
import { useTranslation } from '../i18n';
import { useSessionStore } from '../store/sessionStore';

interface HomeScreenProps {
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const { t } = useTranslation();
  const { language, setLanguage, playerName } = useSessionStore();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.greeting', { name: playerName })}</Text>
        <Button
          title={language === 'en' ? 'አማርኛ' : 'English'}
          onPress={toggleLanguage}
          variant="outline"
          style={styles.langButton}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.appTitle}>Gebeta</Text>
        
        <Card variant="wood" style={styles.modeCard}>
          <Text style={styles.cardTitle}>{t('home.passPlay')}</Text>
          <Text style={styles.cardSubtitle}>{t('home.passPlaySub')}</Text>
          <Button
            title={t('home.passPlay')}
            onPress={onStartGame}
            variant="primary"
            style={styles.playButton}
          />
        </Card>

        <Card style={styles.modeCard}>
          <Text style={styles.disabledTitle}>{t('home.playAi')}</Text>
          <Text style={styles.disabledSubtitle}>{t('home.comingSoon')}</Text>
        </Card>

        <Card style={styles.modeCard}>
          <Text style={styles.disabledTitle}>{t('home.playFriend')}</Text>
          <Text style={styles.disabledSubtitle}>{t('home.comingSoon')}</Text>
        </Card>
      </ScrollView>

      <CulturalBand />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    paddingTop: spacing.space6,
    paddingBottom: spacing.space3,
  },
  greeting: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
  },
  langButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  scrollContent: {
    padding: spacing.space4,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.woodDark,
    marginBottom: spacing.space5,
  },
  modeCard: {
    width: '100%',
    marginBottom: spacing.space4,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textOnWood,
    marginBottom: spacing.space1,
  },
  cardSubtitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.primary,
    color: colors.textOnWood,
    opacity: 0.8,
    marginBottom: spacing.space4,
  },
  playButton: {
    width: '100%',
  },
  disabledTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textSecondary,
    marginBottom: spacing.space1,
  },
  disabledSubtitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.primary,
    color: colors.textSecondary,
  },
});
