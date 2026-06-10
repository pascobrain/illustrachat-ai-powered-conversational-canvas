import { create } from 'zustand';
import { chatService } from '@/lib/chat';
import type { SessionInfo } from '@shared/types';
import { toast } from 'sonner';
interface ChatSessionsState {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  isLoading: boolean;
  loadSessions: () => Promise<void>;
  setActiveSessionId: (id: string | null) => void;
  createNewSession: (firstMsg?: string) => Promise<string | null>;
  deleteChatSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  clearAllSessions: () => Promise<void>;
}
export const useChatSessions = create<ChatSessionsState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  loadSessions: async () => {
    set({ isLoading: true });
    const res = await chatService.listSessions();
    if (res.success && res.data) {
      set({ sessions: res.data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  createNewSession: async (firstMsg) => {
    const res = await chatService.createSession(undefined, undefined, firstMsg);
    if (res.success && res.data) {
      const newSession: SessionInfo = {
        id: res.data.sessionId,
        title: res.data.title,
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      set(state => ({
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id
      }));
      return newSession.id;
    }
    toast.error("Failed to create new session");
    return null;
  },
  deleteChatSession: async (id) => {
    const res = await chatService.deleteSession(id);
    if (res.success) {
      set(state => {
        const nextSessions = state.sessions.filter(s => s.id !== id);
        const nextActive = state.activeSessionId === id
          ? (nextSessions[0]?.id || null)
          : state.activeSessionId;
        return { sessions: nextSessions, activeSessionId: nextActive };
      });
      toast.success("Session deleted");
    } else {
      toast.error("Failed to delete session");
    }
  },
  renameSession: async (id, title) => {
    const previousSessions = get().sessions;
    // Optimistic Update
    set(state => ({
      sessions: state.sessions.map(s => s.id === id ? { ...s, title } : s)
    }));
    const res = await chatService.updateSessionTitle(id, title);
    if (!res.success) {
      set({ sessions: previousSessions });
      toast.error("Failed to rename session");
    }
  },
  clearAllSessions: async () => {
    const res = await chatService.clearAllSessions();
    if (res.success) {
      set({ sessions: [], activeSessionId: null });
      toast.success("All conversations cleared");
    } else {
      toast.error("Failed to clear conversations");
    }
  }
}));