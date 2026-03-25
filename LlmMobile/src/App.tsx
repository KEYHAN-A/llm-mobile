import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAppTheme } from './theme/useAppTheme';

function AppContent() {
  const { isDark } = useAppTheme();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <AppContent />
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
