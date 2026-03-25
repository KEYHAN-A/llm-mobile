export type RootStackParamList = {
  Onboarding: undefined;
  Chat: { conversationId?: string } | undefined;
  ConversationList: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
