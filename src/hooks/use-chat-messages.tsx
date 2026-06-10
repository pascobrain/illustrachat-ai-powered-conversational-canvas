import { create } from 'zustand';
import { chatService } from '@/lib/chat';
import type { Message } from '@shared/types';
interface ChatMessagesState {
  messages: Message[];
  isProcessing: boolean;
  streamingMessage: string | null;
  loadMessages: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, text: string) => Promise<void>;
  clearMessages: (sessionId: string) => Promise<void>;
}
export const useChatMessages = create<ChatMessagesState>((set) => ({
  messages: [],
  isProcessing: false,
  streamingMessage: null,
  loadMessages: async (sessionId: string) => {
    const res = await chatService.getMessages(sessionId);
    if (res.success && res.data) {
      set({ messages: res.data.messages || [] });
    }
  },
  sendMessage: async (sessionId: string, text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    set(state => ({ 
      messages: [...state.messages, userMsg],
      isProcessing: true,
      streamingMessage: '' 
    }));
    try {
      let accumulated = '';
      const res = await chatService.sendMessage(
        sessionId, 
        text, 
        undefined, 
        (chunk) => {
          accumulated += chunk;
          set({ streamingMessage: accumulated });
        }
      );
      if (res.success) {
        const fullRes = await chatService.getMessages(sessionId);
        if (fullRes.success && fullRes.data) {
          set({ 
            messages: fullRes.data.messages,
            isProcessing: false,
            streamingMessage: null 
          });
        }
      }
    } catch (e) {
      console.error('Failed to send message:', e);
      set({ isProcessing: false, streamingMessage: null });
    }
  },
  clearMessages: async (sessionId: string) => {
    const res = await chatService.clearMessages(sessionId);
    if (res.success) {
      set({ messages: [] });
    }
  }
}));