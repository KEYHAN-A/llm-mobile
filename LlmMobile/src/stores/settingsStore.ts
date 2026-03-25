import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../utils/storage';
import {
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_TOP_K,
  DEFAULT_MAX_TOKENS,
  DEFAULT_MAX_CONTEXT_MESSAGES,
  DEFAULT_N_CTX,
  DEFAULT_SYSTEM_PROMPT,
} from '../utils/constants';

interface SettingsState {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  systemPrompt: string;
  maxContextMessages: number;
  contextWindowSize: number;
  hapticFeedback: boolean;
  theme: 'light' | 'dark' | 'system';

  updateSettings: (params: Partial<Omit<SettingsState, 'updateSettings' | 'resetToDefaults'>>) => void;
  resetToDefaults: () => void;
}

const defaults = {
  temperature: DEFAULT_TEMPERATURE,
  topP: DEFAULT_TOP_P,
  topK: DEFAULT_TOP_K,
  maxTokens: DEFAULT_MAX_TOKENS,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  maxContextMessages: DEFAULT_MAX_CONTEXT_MESSAGES,
  contextWindowSize: DEFAULT_N_CTX,
  hapticFeedback: true,
  theme: 'system' as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,

      updateSettings: (params) => set(params),
      resetToDefaults: () => set(defaults),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
