import React, { useState } from 'react';
import type { Message, ToolCall } from '@shared/types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/lib/markdown-renderer';
import { Copy, Check, Wrench, CloudSun, Trash2, ChevronDown, ChevronUp, Database, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/chat';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { motion, AnimatePresence } from 'framer-motion';
const TOOL_ICONS: Record<string, any> = { weather: CloudSun, search: Search, db: Database, sql: Database };
const ToolCard = ({ tool }: { tool: ToolCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = Object.entries(TOOL_ICONS).find(([k]) => tool.name.includes(k))?.[1] || Wrench;
  return (
    <div className="w-full bg-accent/40 rounded-2xl border border-border/40 overflow-hidden text-xs my-3 shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/60 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-turquoise/10 text-turquoise"><Icon className="w-4 h-4" /></div>
          <span className="font-bold uppercase tracking-widest text-[10px] opacity-80">{tool.name} executed</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-40" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border/20 bg-background/50 p-4 space-y-4">
             <div className="space-y-1.5">
               <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Query Parameters</span>
               <pre className="p-3 bg-muted/40 rounded-xl overflow-x-auto text-[10px] font-mono border border-border/30">{JSON.stringify(tool.arguments, null, 2)}</pre>
             </div>
             {tool.result && (
               <div className="space-y-1.5">
                 <span className="text-[9px] uppercase font-bold text-turquoise tracking-tighter">Response Data</span>
                 <div className="p-3 bg-turquoise/5 rounded-xl border border-turquoise/10 text-[11px] max-h-60 overflow-y-auto leading-relaxed">
                   {typeof tool.result === 'string' ? tool.result : <pre className="font-mono text-[10px]">{JSON.stringify(tool.result, null, 2)}</pre>}
                 </div>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export function ChatMessage({ message }: { message: Message }) {
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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={cn("flex w-full group mb-10 items-start gap-4 px-2", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-soft transition-transform group-hover:scale-105", 
        isUser ? "bg-coral-red border-coral-red/30 text-white" : "bg-card border-border text-turquoise"
      )}>
        {isUser ? (
          <span className="text-[11px] font-bold">YOU</span>
        ) : (
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        )}
      </div>
      <div className={cn("relative max-w-[88%] space-y-2 flex flex-col", isUser ? "items-end text-right" : "items-start text-left")}>
        <div className={cn(
          "px-6 py-5 rounded-[2.5rem] shadow-soft relative border transition-all duration-300", 
          isUser ? "bg-coral-red/5 border-coral-red/10 rounded-tr-none hover:bg-coral-red/10" : "bg-card border-border rounded-tl-none hover:border-turquoise/30"
        )}>
          <div className={cn("absolute -top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10", isUser ? "right-8" : "left-8")}>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-soft hover:scale-110 active:scale-95" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-turquoise" /> : <Copy className="w-4 h-4" />}
            </Button>
            {!isStreaming && (
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-soft hover:text-destructive active:scale-95" onClick={() => activeSessionId && deleteMessage(activeSessionId, message.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed",
            isStreaming && "after:content-[''] after:inline-block after:w-2 after:h-4 after:bg-turquoise after:ml-1 after:animate-pulse"
          )}>
            {!message.content && isStreaming ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-4 w-[85%] rounded-full" />
                <Skeleton className="h-4 w-[70%] rounded-full" />
                <Skeleton className="h-4 w-[60%] rounded-full opacity-50" />
              </div>
            ) : <MarkdownRenderer content={message.content} />}
          </div>
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-4 border-t border-border/30 pt-2">
              {message.toolCalls.map(tc => <ToolCard key={tc.id} tool={tc} />)}
            </div>
          )}
        </div>
        <div className="px-4 text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          {formatTime(message.timestamp)}
          {!isUser && <span className="w-1 h-1 rounded-full bg-border" />}
          {!isUser && <span className="opacity-60">Verified AI Response</span>}
        </div>
      </div>
    </motion.div>
  );
}