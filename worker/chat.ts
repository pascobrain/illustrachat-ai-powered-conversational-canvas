import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    // Robust URL cleaning to prevent the 'directOverride' crash
    // The OpenAI SDK crashes if baseURL is invalid or has specific trailing patterns in certain environments
    const cleanedURL = (aiGatewayUrl || '').trim().replace(/\/+$/, '');
    // Fallback to a safe string if empty to prevent internal SDK undefined access
    const finalBaseURL = cleanedURL || 'https://gateway.ai.cloudflare.com/v1/invalid/placeholder/openai';
    this.client = new OpenAI({
      baseURL: finalBaseURL,
      apiKey: apiKey || 'missing-key',
      // Explicitly provide fetch to avoid environment detection issues in DO/Workers
      fetch: (...args) => fetch(...args),
      // Prevent the SDK from trying to use browser-specific logic that might trigger directOverride
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'X-Project': 'IllustraChat-v1.2'
      }
    });
    this.model = model;
  }
  async processMessage(
    message: string,
    conversationHistory: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    const messages = this.buildConversationMessages(message, conversationHistory);
    const toolDefinitions = await getToolDefinitions();
    try {
      if (onChunk) {
        const stream = await this.client.chat.completions.create({
          model: this.model,
          messages,
          tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
          tool_choice: toolDefinitions.length > 0 ? 'auto' : undefined,
          stream: true,
        });
        return this.handleStreamResponse(stream, message, conversationHistory, onChunk);
      }
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
        tool_choice: toolDefinitions.length > 0 ? 'auto' : undefined,
        stream: false
      });
      return this.handleNonStreamResponse(completion, message, conversationHistory);
    } catch (error: any) {
      console.error('OpenAI Request Error:', error);
      // provide more context for debugging the 'directOverride' or 500 errors
      if (error?.message?.includes('directOverride') || error?.status === 500) {
        throw new Error(`AI_GATEWAY_CONFIGURATION_ERROR: ${error.message}`);
      }
      throw error;
    }
  }
  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        fullContent += delta.content;
        onChunk(delta.content);
      }
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const i = tc.index;
          if (!accumulatedToolCalls[i]) {
            accumulatedToolCalls[i] = {
              id: tc.id || `tool_${Date.now()}_${i}`,
              type: 'function',
              function: { name: tc.function?.name || '', arguments: tc.function?.arguments || '' }
            };
          } else {
            if (tc.function?.name) accumulatedToolCalls[i].function.name += tc.function.name;
            if (tc.function?.arguments) accumulatedToolCalls[i].function.arguments += tc.function.arguments;
          }
        }
      }
    }
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls);
      const finalResponse = await this.generateToolResponse(message, conversationHistory, accumulatedToolCalls, executedTools);
      return { content: finalResponse, toolCalls: executedTools };
    }
    return { content: fullContent };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) return { content: 'No response from AI.' };
    if (!responseMessage.tool_calls) return { content: responseMessage.content || '' };
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(message, conversationHistory, responseMessage.tool_calls as any, toolCalls);
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(openAiToolCalls.map(async (tc) => {
      try {
        const args = JSON.parse(tc.function.arguments || '{}');
        const result = await executeTool(tc.function.name, args);
        return { id: tc.id, name: tc.function.name, arguments: args, result };
      } catch (error) {
        return { id: tc.id, name: tc.function.name, arguments: {}, result: { error: 'Tool execution failed' } };
      }
    }));
  }
  private async generateToolResponse(userMsg: string, history: Message[], calls: any[], results: ToolCall[]): Promise<string> {
    const followUp = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'Respond naturally to tool results.' },
        ...history.slice(-3).map(m => ({ role: m.role as any, content: m.content })),
        { role: 'user', content: userMsg },
        { role: 'assistant', content: null, tool_calls: calls },
        ...results.map((r, i) => ({ role: 'tool' as const, content: JSON.stringify(r.result), tool_call_id: calls[i]?.id || r.id }))
      ]
    });
    return followUp.choices[0]?.message?.content || 'Processed tool results.';
  }
  private buildConversationMessages(userMessage: string, history: Message[]) {
    return [
      { role: 'system' as const, content: 'You are IllustraChat AI, a creative conversational assistant.' },
      ...history.slice(-10).map(m => ({ role: m.role as any, content: m.content })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void {
    this.model = newModel;
  }
}