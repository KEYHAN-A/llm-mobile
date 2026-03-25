import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../utils/storage';
import type { Message, Conversation } from '../types/chat';

interface ChatState {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  streamingMessageId: string | null;

  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, msg: Omit<Message, 'id'>) => string;
  appendToStreamingMessage: (convId: string, msgId: string, newText: string) => void;
  finalizeStreamingMessage: (
    convId: string,
    msgId: string,
    timings?: Message['timings'],
  ) => void;
  emergencyFinalizeStreaming: () => void;
  clearStreamingState: () => void;
}

let idCounter = 0;
const generateId = () => `${Date.now()}-${++idCounter}`;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {},
      messages: {},
      activeConversationId: null,
      streamingMessageId: null,

      createConversation: () => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 0,
        };
        set((state) => ({
          conversations: { ...state.conversations, [id]: conversation },
          messages: { ...state.messages, [id]: [] },
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const { [id]: _conv, ...restConversations } = state.conversations;
          const { [id]: _msgs, ...restMessages } = state.messages;
          return {
            conversations: restConversations,
            messages: restMessages,
            activeConversationId:
              state.activeConversationId === id
                ? null
                : state.activeConversationId,
          };
        });
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, msg) => {
        const id = generateId();
        const message: Message = { ...msg, id };
        set((state) => {
          const convMsgs = state.messages[conversationId] ?? [];
          const conversation = state.conversations[conversationId];

          // Auto-title from first user message
          let updatedConv = conversation;
          if (
            conversation &&
            conversation.title === 'New Chat' &&
            msg.role === 'user'
          ) {
            updatedConv = {
              ...conversation,
              title: msg.content.slice(0, 50) + (msg.content.length > 50 ? '...' : ''),
              updatedAt: Date.now(),
              messageCount: convMsgs.length + 1,
            };
          } else if (conversation) {
            updatedConv = {
              ...conversation,
              updatedAt: Date.now(),
              messageCount: convMsgs.length + 1,
            };
          }

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...convMsgs, message],
            },
            conversations: {
              ...state.conversations,
              [conversationId]: updatedConv,
            },
            streamingMessageId: msg.isStreaming ? id : state.streamingMessageId,
          };
        });
        return id;
      },

      appendToStreamingMessage: (convId, msgId, newText) => {
        set((state) => {
          const msgs = state.messages[convId];
          if (!msgs) return state;
          const idx = msgs.findIndex((m) => m.id === msgId);
          if (idx === -1) return state;

          const updatedMsgs = [...msgs];
          updatedMsgs[idx] = {
            ...msgs[idx],
            streamingContent: msgs[idx].streamingContent + newText,
          };

          return {
            messages: { ...state.messages, [convId]: updatedMsgs },
          };
        });
      },

      finalizeStreamingMessage: (convId, msgId, timings) => {
        set((state) => {
          const msgs = state.messages[convId];
          if (!msgs) return state;
          const idx = msgs.findIndex((m) => m.id === msgId);
          if (idx === -1) return state;

          const updatedMsgs = [...msgs];
          updatedMsgs[idx] = {
            ...msgs[idx],
            content: msgs[idx].streamingContent,
            streamingContent: '',
            isStreaming: false,
            timings,
          };

          return {
            messages: { ...state.messages, [convId]: updatedMsgs },
            streamingMessageId: null,
          };
        });
      },

      emergencyFinalizeStreaming: () => {
        const { streamingMessageId, activeConversationId, messages } = get();
        if (!streamingMessageId || !activeConversationId) return;

        const msgs = messages[activeConversationId];
        if (!msgs) return;
        const idx = msgs.findIndex((m) => m.id === streamingMessageId);
        if (idx === -1) return;

        set((state) => {
          const convMsgs = state.messages[activeConversationId]!;
          const updatedMsgs = [...convMsgs];
          updatedMsgs[idx] = {
            ...convMsgs[idx],
            content:
              convMsgs[idx].streamingContent || '[Generation stopped due to memory pressure]',
            streamingContent: '',
            isStreaming: false,
          };

          return {
            messages: { ...state.messages, [activeConversationId]: updatedMsgs },
            streamingMessageId: null,
          };
        });
      },

      clearStreamingState: () => set({ streamingMessageId: null }),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        // Exclude: activeConversationId, streamingMessageId (session-only)
      }),
    },
  ),
);
