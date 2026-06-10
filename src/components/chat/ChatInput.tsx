import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import { useChatMessages } from '@/hooks/use-chat-messages';
interface ChatInputProps {
  activeSessionId: string;
}
export function ChatInput({ activeSessionId }: ChatInputProps) {
  const [input, setInput] = useState('');
  const sendMessage = useChatMessages(s => s.sendMessage);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const content = input;
    setInput('');
    await sendMessage(activeSessionId, content);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  useEffect(() => {
    if (!isProcessing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isProcessing]);
  return (
    <div className="relative group max-w-4xl mx-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-coral-red/20 to-turquoise/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
      <div className="relative flex items-end gap-2 bg-background rounded-xl p-2 border border-border shadow-soft">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message or ask for a diagram..."
          className="flex-1 min-h-[48px] max-h-[200px] resize-none border-none focus-visible:ring-0 shadow-none bg-transparent py-3 px-4"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          className="h-10 w-10 p-0 rounded-lg btn-gradient shrink-0"
        >
          {isProcessing ? (
            <Sparkles className="w-4 h-4 animate-pulse" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}