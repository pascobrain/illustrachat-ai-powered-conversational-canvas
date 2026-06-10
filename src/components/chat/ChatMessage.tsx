import React, { useState } from 'react';
import type { Message, ToolCall } from '@shared/types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/lib/markdown-renderer';
import { Copy, Check, Wrench, CloudSun, Trash2, ChevronDown, ChevronUp, Code, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/chat';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { motion, AnimatePresence } from 'framer-motion';
interface ToolCardProps {
  tool: ToolCall;
}
const ToolCard = ({ tool }: ToolCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const getIcon = (name: string) => {
    if (name.includes('weather')) return <CloudSun className="w-4 h-4" />;
    if (name.includes('search')) return <Search className="w-4 h-4" />;
    if (name.includes('db') || name.includes('sql')) return <Database className="w-4 h-4" />;
    return <Wrench className="w-4 h-4" />;
  };
  return (
    <div className="w-full bg-accent/30 rounded-2xl border border-border/40 overflow-hidden text-xs my-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-turquoise/10 text-turquoise">
            {getIcon(tool.name)}
          </div>
          <span className="font-bold uppercase tracking-widest text-[10px]">{tool.name}</span>
          <Badge variant="outline" className="text-[9px] font-medium opacity-60 px-1 py-0 h-4">Tool</Badge>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-40" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-border/20"
          >
            <div className="p-4 space-y-3 bg-background/30">
              <div>
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Arguments</span>
                <pre className="p-2 bg-muted/40 rounded-lg overflow-x-auto text-[10px] font-mono border border-border/20">
                  {JSON.stringify(tool.arguments, null, 2)}
                </pre>
              </div>
              {tool.result && (
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Result</span>
                  <div className="p-2 bg-turquoise/5 rounded-lg text-[11px] leading-relaxed border border-turquoise/10">
                    {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
interface ChatMessageProps {
  message: Message;
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.id === 'streaming';
  const [copied, setCopied] = useState(false);
  const deleteMessage = useChatMessages(s => s.deleteMessage);
  const activeSessionId = useChatSessions(s => s.activeSessionId);
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDelete = () => {
    if (activeSessionId) deleteMessage(activeSessionId, message.id);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full group mb-8 items-start gap-4 px-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
        isUser 
          ? "bg-coral-red border-coral-red/30 text-white" 
          : "bg-white dark:bg-zinc-800 border-border text-turquoise"
      )}>
        {isUser ? (
          <span className="text-[10px] font-bold">ME</span>
        ) : (
          <motion.div
            animate={isStreaming ? { rotate: 360 } : {}}
            transition={isStreaming ? { duration: 4, repeat: Infinity, ease: "linear" } : {}}
          >
            <Code className="w-4 h-4" />
          </motion.div>
        )}
      </div>
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[80%] space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-6 py-5 rounded-[2rem] shadow-soft relative transition-all duration-300",
          isUser
            ? "bg-coral-red/5 text-foreground border border-coral-red/10 rounded-tr-none"
            : "bg-card text-foreground border border-border rounded-tl-none group-hover:shadow-md"
        )}>
          {/* Action Overlay */}
          <div className={cn(
            "absolute -top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10",
            isUser ? "right-6" : "left-6"
          )}>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full bg-background border border-border shadow-sm hover:text-turquoise transition-colors"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            {!isStreaming && (
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full bg-background border border-border shadow-sm hover:text-destructive transition-colors"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-2xl",
            isStreaming && "after:content-['|'] after:inline-block after:animate-pulse after:ml-1 after:text-turquoise after:font-bold after:text-lg"
          )}>
            <MarkdownRenderer content={message.content} />
          </div>
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
              {message.toolCalls.map((tc) => (
                <ToolCard key={tc.id} tool={tc} />
              ))}
            </div>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className={isUser ? "text-coral-red/60" : "text-turquoise/60"}>
            {isUser ? 'Adventurer' : 'IllustraChat'}
          </span>
          <span>•</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
}