import React, { useState } from 'react';
import type { Message } from '@shared/types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/lib/markdown-renderer';
import { Copy, Check, Wrench, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/chat';
import { motion, AnimatePresence } from 'framer-motion';
interface ChatMessageProps {
  message: Message;
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full group mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[75%] space-y-1.5",
        isUser ? "order-1" : "order-2"
      )}>
        <div className={cn(
          "px-5 py-4 rounded-3xl shadow-soft relative transition-all duration-300",
          isUser
            ? "bg-coral-red/10 text-foreground border border-coral-red/20 rounded-tr-none hover:bg-coral-red/[0.15]"
            : "bg-card text-foreground border border-border rounded-tl-none hover:shadow-md"
        )}>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
              onClick={handleCopy}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="w-3.5 h-3.5 text-turquoise" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
            <MarkdownRenderer content={message.content} />
          </div>
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
              {message.toolCalls.map((tc) => (
                <Badge key={tc.id} variant="secondary" className="gap-1.5 py-0.5 px-2 text-[10px] bg-turquoise/10 text-turquoise-foreground border-turquoise/20">
                  {tc.name.includes('weather') ? <CloudSun className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                  {tc.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-2 px-2 text-[10px] text-muted-foreground/50 font-medium tracking-tight",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className={cn(isUser ? "text-coral-red/70" : "text-turquoise/70")}>
            {isUser ? 'You' : 'IllustraChat'}
          </span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
}