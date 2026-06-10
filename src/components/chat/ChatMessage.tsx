import React from 'react';
import { Message } from '@/worker/types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/lib/markdown-renderer';
import { Copy, Check, Wrench, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { formatTime } from '@/lib/chat';
interface ChatMessageProps {
  message: Message;
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={cn(
      "flex w-full group animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[75%] space-y-2",
        isUser ? "order-1" : "order-2"
      )}>
        <div className={cn(
          "px-5 py-4 rounded-2xl shadow-sm relative",
          isUser 
            ? "bg-coral-red/10 text-foreground border border-coral-red/20 rounded-tr-none" 
            : "bg-muted text-foreground border border-border rounded-tl-none"
        )}>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-4 h-4 text-turquoise" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-3">
              {message.toolCalls.map((tc) => (
                <Badge key={tc.id} variant="secondary" className="gap-1.5 py-1 px-2 text-[10px]">
                  {tc.name.includes('weather') ? <CloudSun className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                  {tc.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-2 px-1 text-[10px] text-muted-foreground/60",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="font-medium">{isUser ? 'You' : 'IllustraChat'}</span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}