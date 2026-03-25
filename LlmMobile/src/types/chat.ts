export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streamingContent: string;
  isStreaming: boolean;
  timestamp: number;
  timings?: {
    promptTokens: number;
    completionTokens: number;
    tokensPerSecond: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export type StreamingState = {
  isStreaming: boolean;
  activeConversationId: string | null;
  streamingMessageId: string | null;
};
