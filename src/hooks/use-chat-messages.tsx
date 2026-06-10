import { create } from 'zustand';
import { chatService } from '@/lib/chat';
import type { Message } from '@shared/types';
import { toast } from 'sonner';
interface ChatMessagesState {
  messages: Message[];
  isProcessing: boolean;
  streamingMessage: string | null;
  abortController: AbortController | null;
  loadMessages: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, text: string, model?: string) => Promise<void>;
  stopGeneration: () => void;
  deleteMessage: (sessionId: string, messageId: string) => Promise<void>;
  clearCurrentSession: (sessionId: string) => Promise<void>;
}
export const useChatMessages = create<ChatMessagesState>((set, get) => ({
  messages: [],
  isProcessing: false,
  streamingMessage: null,
  abortController: null,
  loadMessages: async (sessionId: string) => {
    const res = await chatService.getMessages(sessionId);
    if (res.success && res.data) {
      set({ messages: res.data.messages || [] });
    }
  },
  sendMessage: async (sessionId: string, text: string, model?: string) => {
    const controller = new AbortController();
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    set(state => ({
      messages: [...state.messages, userMsg],
      isProcessing: true,
      streamingMessage: '',
      abortController: controller
    }));
    try {
      let accumulated = '';
      const res = await chatService.sendMessage(
        sessionId,
        text,
        model,
        (chunk) => {
          if (controller.signal.aborted) return;
          accumulated += chunk;
          set({ streamingMessage: accumulated });
        }
      );
      if (res.success && !controller.signal.aborted) {
        const fullRes = await chatService.getMessages(sessionId);
        if (fullRes.success && fullRes.data) {
          set({
            messages: fullRes.data.messages,
            isProcessing: false,
            streamingMessage: null,
            abortController: null
          });
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Failed to send message:', e);
        toast.error("Message failed to send");
      }
      set({ isProcessing: false, streamingMessage: null, abortController: null });
    }
  },
  stopGeneration: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
      set({ isProcessing: false, streamingMessage: null, abortController: null });
      toast.info("Generation stopped");
    }
  },
  deleteMessage: async (sessionId, messageId) => {
    set(state => ({
      messages: state.messages.filter(m => m.id !== messageId)
    }));
    toast.success("Message removed from view");
  },
  clearCurrentSession: async (sessionId: string) => {
    const res = await chatService.clearMessages(sessionId);
    if (res.success) {
      set({ messages: [] });
      toast.success("Session history cleared");
    } else {
      toast.error("Failed to clear session history");
    }
  }
}));