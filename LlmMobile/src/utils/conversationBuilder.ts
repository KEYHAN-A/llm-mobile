import type { LlamaContext } from 'llama.rn';
import { useChatStore } from '../stores/chatStore';
import { useSettingsStore } from '../stores/settingsStore';

export interface OAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function buildMessages(
  conversationId: string,
  context: LlamaContext,
): Promise<OAIMessage[]> {
  const allMessages = useChatStore.getState().messages[conversationId] ?? [];
  const settings = useSettingsStore.getState();

  const systemMsg: OAIMessage = {
    role: 'system',
    content: settings.systemPrompt,
  };

  // Take last N messages
  let recentMessages: OAIMessage[] = allMessages
    .filter((m) => m.role !== 'system' && !m.isStreaming)
    .slice(-settings.maxContextMessages)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  // Token budget: contextWindowSize - maxTokens - safety margin
  const budget = settings.contextWindowSize - settings.maxTokens - 100;

  // Progressively trim oldest messages if over budget
  let messages: OAIMessage[] = [systemMsg, ...recentMessages];
  try {
    let formatted = await context.getFormattedChat(messages);
    let prompt = typeof formatted === 'string' ? formatted : (formatted as any).prompt;
    let tokenResult = await context.tokenize(prompt);
    let tokenCount = tokenResult.tokens.length;

    while (tokenCount > budget && recentMessages.length > 2) {
      recentMessages = recentMessages.slice(1);
      messages = [systemMsg, ...recentMessages];
      formatted = await context.getFormattedChat(messages);
      prompt = typeof formatted === 'string' ? formatted : (formatted as any).prompt;
      tokenResult = await context.tokenize(prompt);
      tokenCount = tokenResult.tokens.length;
    }
  } catch {
    // If tokenization fails, just use the messages as-is (trimmed to maxContextMessages)
  }

  return [systemMsg, ...recentMessages];
}
