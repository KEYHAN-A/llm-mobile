import { useModelStore } from '../stores/modelStore';
import { useChatStore } from '../stores/chatStore';
import { useSettingsStore } from '../stores/settingsStore';
import { buildMessages } from '../utils/conversationBuilder';
import { DEFAULT_STOP_TOKENS } from '../utils/constants';
import type { Message } from '../types/chat';

// RAF token batching state
let tokenBuffer = '';
let flushScheduled = false;
let currentConvId: string | null = null;
let currentMsgId: string | null = null;

function flushTokenBuffer() {
  if (!currentConvId || !currentMsgId || !tokenBuffer) return;
  useChatStore
    .getState()
    .appendToStreamingMessage(currentConvId, currentMsgId, tokenBuffer);
  tokenBuffer = '';
  flushScheduled = false;
}

export async function generateResponse(
  conversationId: string,
  userMessage: string,
): Promise<void> {
  const context = useModelStore.getState().context;
  if (!context) throw new Error('Model not loaded');

  const chatStore = useChatStore.getState();
  const settings = useSettingsStore.getState();

  // Add user message
  chatStore.addMessage(conversationId, {
    conversationId,
    role: 'user',
    content: userMessage,
    streamingContent: '',
    isStreaming: false,
    timestamp: Date.now(),
  });

  // Add assistant placeholder (streaming)
  const assistantMsgId = chatStore.addMessage(conversationId, {
    conversationId,
    role: 'assistant',
    content: '',
    streamingContent: '',
    isStreaming: true,
    timestamp: Date.now(),
  });

  // Set up RAF batching state
  currentConvId = conversationId;
  currentMsgId = assistantMsgId;
  tokenBuffer = '';
  flushScheduled = false;

  try {
    // Build context-aware messages array
    const messages = await buildMessages(conversationId, context);

    // Run completion with streaming
    const result = await context.completion(
      {
        messages,
        n_predict: settings.maxTokens,
        temperature: settings.temperature,
        top_p: settings.topP,
        top_k: settings.topK,
        stop: DEFAULT_STOP_TOKENS,
      },
      (data: { token: string }) => {
        // JSI callback — fires for each token
        tokenBuffer += data.token;

        if (!flushScheduled) {
          flushScheduled = true;
          requestAnimationFrame(flushTokenBuffer);
        }
      },
    );

    // Final flush of any remaining tokens
    if (tokenBuffer) {
      flushTokenBuffer();
    }

    // Extract timings
    const timings: Message['timings'] =
      result.timings
        ? {
            promptTokens: result.timings.prompt_n ?? 0,
            completionTokens: result.timings.predicted_n ?? 0,
            tokensPerSecond: result.timings.predicted_per_second ?? 0,
          }
        : undefined;

    // Finalize the message
    useChatStore
      .getState()
      .finalizeStreamingMessage(conversationId, assistantMsgId, timings);

    // Detect thermal throttling
    if (timings && timings.tokensPerSecond < 2.0 && timings.completionTokens > 10) {
      useModelStore
        .getState()
        .setError(
          'Your device is running warm. Generation speed is reduced. Consider taking a break.',
        );
    }
  } catch (error) {
    // Final flush before error handling
    if (tokenBuffer) {
      flushTokenBuffer();
    }

    // Finalize with whatever content exists
    useChatStore
      .getState()
      .finalizeStreamingMessage(conversationId, assistantMsgId);

    const message =
      error instanceof Error ? error.message : 'Generation failed';
    useModelStore.getState().setError(message);
    throw error;
  } finally {
    currentConvId = null;
    currentMsgId = null;
    tokenBuffer = '';
    flushScheduled = false;
  }
}

export async function stopGeneration(): Promise<void> {
  const context = useModelStore.getState().context;
  if (!context) return;

  try {
    await context.stopCompletion();
  } catch {
    // may already be stopped
  }

  // Flush remaining tokens
  if (tokenBuffer) {
    flushTokenBuffer();
  }

  // Finalize the current streaming message
  const { streamingMessageId, activeConversationId } = useChatStore.getState();
  if (streamingMessageId && activeConversationId) {
    useChatStore
      .getState()
      .finalizeStreamingMessage(activeConversationId, streamingMessageId);
  }
}
