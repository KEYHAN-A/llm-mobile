import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useModelStore } from '../stores/modelStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ConversationListScreen } from '../screens/ConversationListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const selectedModel = useModelStore((s) => s.selectedModelFilename);

  return (
    <Stack.Navigator
      initialRouteName={selectedModel ? 'Chat' : 'Onboarding'}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen
        name="ConversationList"
        component={ConversationListScreen}
        options={{ animation: 'slide_from_left' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
