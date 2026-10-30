import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';

type Screen = 'splash' | 'home' | 'game' | 'result';

export const RootNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  return (
    <View style={styles.container}>
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('home')} />
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
