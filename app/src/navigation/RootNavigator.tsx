import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { useSessionStore } from '../store/sessionStore';

type Screen = 'splash' | 'onboarding' | 'home' | 'game' | 'result';

export const RootNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const { playerName, setPlayerName } = useSessionStore();

  const handleSplashFinish = () => {
    // If player name is not set or still default 'Player', show onboarding (S02)
    if (!playerName || playerName === 'Player') {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleOnboardingComplete = (name: string) => {
    setPlayerName(name);
    setCurrentScreen('home');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {currentScreen === 'home' && (
        <HomeScreen onStartGame={() => setCurrentScreen('game')} />
      )}
      {currentScreen === 'game' && (
        <GameScreen
          onGameOver={() => setCurrentScreen('result')}
          onLeaveGame={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'result' && (
        <ResultScreen
          onRematch={() => setCurrentScreen('game')}
          onHome={() => setCurrentScreen('home')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
