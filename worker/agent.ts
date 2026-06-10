import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: '',
    isProcessing: false,
    model: 'google-ai-studio/gemini-3.1-flash-lite'
  };
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      this.state.model || this.initialState.model
    );
    if (!this.state.sessionId) {
      this.setState({ ...this.state, sessionId: this.name });
    }
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/messages') return this.handleGetMessages();
      if (method === 'POST' && url.pathname === '/chat') return this.handleChatMessage(await request.json());
      if (method === 'DELETE' && url.pathname === '/clear') return this.handleClearMessages();
      if (method === 'POST' && url.pathname === '/model') return this.handleModelUpdate(await request.json());
      const deleteMsgMatch = url.pathname.match(/^\/message\/([^/]+)$/);
      if (method === 'DELETE' && deleteMsgMatch) return this.handleDeleteMessage(deleteMsgMatch[1]);
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('[AGENT REQUEST ERROR]', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private handleGetMessages(): Response {
    return Response.json({ success: true, data: { ...this.initialState, ...this.state } });
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream } = body;
    if (!message?.trim()) return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    const currentMessages = this.state.messages || [];
    this.setState({ ...this.state, messages: [...currentMessages, userMessage], isProcessing: true });
    try {
      if (!this.chatHandler) throw new Error('Chat handler not initialized');
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            this.setState({ ...this.state, streamingMessage: '' });
            const response = await this.chatHandler!.processMessage(
              message,
              this.state.messages,
              (chunk: string) => {
                const currentStreaming = this.state.streamingMessage || '';
                this.setState({ ...this.state, streamingMessage: currentStreaming + chunk });
                writer.write(encoder.encode(chunk)).catch(() => {});
              }
            );
            const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
            this.setState({ ...this.state, messages: [...this.state.messages, assistantMessage], isProcessing: false, streamingMessage: '' });
          } catch (error: any) {
            console.error('[STREAMING AGENT ERROR]', error);
            let errorMsg = 'I encountered an error processing your request.';
            if (error.message?.includes('AI_GATEWAY')) {
              errorMsg = 'AI Gateway configuration error. Please check your wrangler.jsonc bindings.';
            }
            const assistantError = createMessage('assistant', errorMsg);
            this.setState({ ...this.state, messages: [...this.state.messages, assistantError], isProcessing: false, streamingMessage: '' });
          } finally {
            try { await writer.close(); } catch (e) {}
          }
        })();
        return createStreamResponse(readable);
      }
      const response = await this.chatHandler.processMessage(message, this.state.messages);
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      this.setState({ ...this.state, messages: [...this.state.messages, assistantMessage], isProcessing: false });
      return Response.json({ success: true, data: this.state });
    } catch (error: any) {
      console.error('[NON-STREAM CHAT ERROR]', error);
      this.setState({ ...this.state, isProcessing: false });
      const errorDetail = error.message?.includes('AI_GATEWAY') 
        ? 'AI Gateway configuration failure. Verify your credentials.' 
        : API_RESPONSES.PROCESSING_ERROR;
      return Response.json({ success: false, error: errorDetail }, { status: 500 });
    }
  }
  private handleClearMessages(): Response {
    this.setState({ ...this.state, messages: [] });
    return Response.json({ success: true, data: this.state });
  }
  private handleModelUpdate(body: { model: string }): Response {
    this.setState({ ...this.state, model: body.model });
    this.chatHandler?.updateModel(body.model);
    return Response.json({ success: true, data: this.state });
  }
  private handleDeleteMessage(messageId: string): Response {
    const nextMessages = (this.state.messages || []).filter(m => m.id !== messageId);
    this.setState({ ...this.state, messages: nextMessages });
    return Response.json({ success: true, data: { deleted: messageId } });
  }
}