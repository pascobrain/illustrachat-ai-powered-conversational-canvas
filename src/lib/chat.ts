import type { Message, ChatState, SessionInfo } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B IT' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' }
];
class ChatService {
  async sendMessage(sessionId: string, message: string, model?: string, onChunk?: (chunk: string) => void): Promise<ChatResponse> {
    try {
      const response = await fetch(`/api/chat/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[API ERROR] sendMessage failed (${response.status}):`, errText);
        return { success: false, error: `Server error: ${response.status}` };
      }
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
      console.error('[NETWORK ERROR] sendMessage:', error);
      return { success: false, error: 'Network failure' };
    }
  }
  async getMessages(sessionId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`/api/chat/${sessionId}/messages`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        console.error('[API ERROR] getMessages:', err);
        return { success: false, error: err.error || 'Failed to load' };
      }
      return await response.json();
    } catch (error) {
      console.error('[NETWORK ERROR] getMessages:', error);
      return { success: false, error: 'Network failure' };
    }
  }
  async clearMessages(sessionId: string): Promise<ChatResponse> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/clear`, { method: 'DELETE' });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
  async updateSessionModel(sessionId: string, model: string): Promise<ChatResponse> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
  async listSessions() {
    try {
      const res = await fetch('/api/sessions');
      return await res.json();
    } catch (e) { return { success: false }; }
  }
  async deleteSession(sessionId: string) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
  async updateSessionTitle(sessionId: string, title: string) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
  async clearAllSessions() {
    try {
      const res = await fetch('/api/sessions', { method: 'DELETE' });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
}
export const chatService = new ChatService();
export const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });