import { useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useModelStore } from '../stores/modelStore';
import * as inferenceService from '../services/inferenceService';

export function useInference() {
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const isStreaming = streamingMessageId !== null;
  const modelStatus = useModelStore((s) => s.status);

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      if (modelStatus !== 'ready') return;
      if (isStreaming) return;

      try {
        await inferenceService.generateResponse(conversationId, text);
      } catch (error) {
        console.error('[useInference] Generation failed:', error);
      }
    },
    [modelStatus, isStreaming],
  );

  const stopGeneration = useCallback(async () => {
    try {
      await inferenceService.stopGeneration();
    } catch (error) {
      console.error('[useInference] Stop failed:', error);
    }
  }, []);

  return {
    sendMessage,
    stopGeneration,
    isStreaming,
    isModelReady: modelStatus === 'ready',
  };
}
