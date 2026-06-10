import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'google-ai-studio/gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  async sendMessage(
    sessionId: string,
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      const url = `/api/chat/${sessionId}/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) onChunk(chunk);
          }
        } finally {
          reader.releaseLock();
        }
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(sessionId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`/api/chat/${sessionId}/messages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return { success: false, error: 'Failed to load messages' };
    }
  }
  async clearMessages(sessionId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`/api/chat/${sessionId}/clear`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to clear messages' };
    }
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[]; error?: string }> {
    try {
      const response = await fetch('/api/sessions');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to delete session' };
    }
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
export const generateSessionTitle = (firstUserMessage?: string): string => {
  const dateTime = new Date().toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  if (!firstUserMessage) return `New Chat • ${dateTime}`;
  const truncated = firstUserMessage.length > 30 ? firstUserMessage.slice(0, 27) + '...' : firstUserMessage;
  return `${truncated} • ${dateTime}`;
};