import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Square, Zap } from 'lucide-react';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
interface ChatInputProps {
  activeSessionId: string;
  model?: string;
}
export function ChatInput({ activeSessionId, model }: ChatInputProps) {
  const [input, setInput] = useState('');
  const sendMessage = useChatMessages(s => s.sendMessage);
  const stopGeneration = useChatMessages(s => s.stopGeneration);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const content = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '48px';
    await sendMessage(activeSessionId, content, model);
  };
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = '48px';
    const scrollHeight = e.target.scrollHeight;
    e.target.style.height = `${Math.min(scrollHeight, 200)}px`;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="relative group max-w-4xl mx-auto w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-coral-red/10 via-turquoise/10 to-coral-red/10 rounded-2xl blur-lg opacity-40 group-focus-within:opacity-100 transition duration-1000 animate-pulse"></div>
      <div className="relative flex flex-col gap-2 bg-background/80 backdrop-blur-md rounded-2xl p-2.5 border border-border shadow-soft group-focus-within:border-turquoise/50 group-focus-within:ring-4 group-focus-within:ring-turquoise/5 transition-all">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={onKeyDown}
            placeholder="Type a message or describe a diagram..."
            className="flex-1 min-h-[48px] max-h-[200px] resize-none border-none focus-visible:ring-0 shadow-none bg-transparent py-3 px-4 font-medium text-sm scrollbar-hide"
            disabled={isProcessing}
          />
          <div className="pb-1 pr-1">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="stop"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Button
                    onClick={stopGeneration}
                    className="h-10 w-10 p-0 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                    title="Stop generation"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-10 w-10 p-0 rounded-xl btn-gradient shadow-soft"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="px-4 pb-1 flex items-center justify-between">
           <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-default">
              <Zap className="w-3 h-3 text-turquoise" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mermaid Ready</span>
           </div>
           <span className={cn(
             "text-[9px] font-bold tracking-tighter opacity-20",
             input.length > 3500 && "opacity-80 text-coral-red"
           )}>
             {input.length} / 4000
           </span>
        </div>
      </div>
    </div>
  );
}