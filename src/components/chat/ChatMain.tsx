import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { Loader2 } from 'lucide-react';
interface ChatMainProps {
  activeSessionId: string;
}
export function ChatMain({ activeSessionId }: ChatMainProps) {
  const messages = useChatMessages(s => s.messages);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const streamingMessage = useChatMessages(s => s.streamingMessage);
  const loadMessages = useChatMessages(s => s.loadMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadMessages(activeSessionId);
  }, [activeSessionId, loadMessages]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {streamingMessage && (
            <ChatMessage 
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingMessage,
                timestamp: Date.now()
              }} 
            />
          )}
          {isProcessing && !streamingMessage && (
            <div className="flex items-center gap-3 text-muted-foreground animate-pulse ml-4">
              <Loader2 className="w-4 h-4 animate-spin text-turquoise" />
              <span className="text-sm font-medium">IllustraChat is thinking...</span>
            </div>
          )}
          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/50 border-t border-border">
        <ChatInput activeSessionId={activeSessionId} />
      </div>
    </div>
  );
}