import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useModelStore } from '../stores/modelStore';
import * as modelManager from '../services/modelManager';
import { useChatStore } from '../stores/chatStore';

export function useModelLifecycle() {
  const status = useModelStore((s) => s.status);
  const selectedModelFilename = useModelStore((s) => s.selectedModelFilename);
  const error = useModelStore((s) => s.error);

  const load = useCallback(async (filename?: string) => {
    try {
      await modelManager.loadModel(filename ?? selectedModelFilename ?? undefined);
    } catch {
      // Error already stored in modelStore
    }
  }, [selectedModelFilename]);

  const unload = useCallback(async () => {
    await modelManager.unloadModel();
  }, []);

  // iOS memory warning handler
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const subscription = AppState.addEventListener('memoryWarning', async () => {
      console.warn('[iOS] Received memory warning');
      const context = useModelStore.getState().context;
      if (context) {
        try {
          await context.stopCompletion();
        } catch {
          // may not be generating
        }
        useChatStore.getState().emergencyFinalizeStreaming();
        await modelManager.unloadModel();
        useModelStore
          .getState()
          .setError('Model unloaded due to memory pressure. Tap to reload.');
      }
    });

    return () => subscription.remove();
  }, []);

  return { status, selectedModelFilename, error, load, unload };
}
