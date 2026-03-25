import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useModelStore } from '../stores/modelStore';
import * as memoryService from '../services/memoryService';
import {
  MEMORY_WARNING_THRESHOLD,
  MEMORY_CRITICAL_THRESHOLD,
  MEMORY_CHECK_INTERVAL,
} from '../utils/constants';

export function useMemoryMonitor() {
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const isStreaming = streamingMessageId !== null;

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      const context = useModelStore.getState().context;
      if (!context) return;

      const ratio = await memoryService.getMemoryUsageRatio();

      if (ratio > MEMORY_CRITICAL_THRESHOLD) {
        console.warn(
          `[MemoryMonitor] CRITICAL: ${(ratio * 100).toFixed(0)}% — stopping inference`,
        );
        try {
          await context.stopCompletion();
        } catch {
          // ignore
        }
        useChatStore.getState().emergencyFinalizeStreaming();
        useModelStore
          .getState()
          .setError(
            'Generation stopped: device memory critically low. Try closing other apps.',
          );
      } else if (ratio > MEMORY_WARNING_THRESHOLD) {
        console.warn(
          `[MemoryMonitor] WARNING: ${(ratio * 100).toFixed(0)}% memory used`,
        );
      }
    }, MEMORY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isStreaming]);
}
