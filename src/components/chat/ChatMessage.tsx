import React, { useState } from 'react';
import type { Message, ToolCall } from '@shared/types';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/lib/markdown-renderer';
import { Copy, Check, Wrench, CloudSun, Trash2, ChevronDown, ChevronUp, Code, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/chat';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { motion, AnimatePresence } from 'framer-motion';
const ToolCard = ({ tool }: { tool: ToolCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const icons: Record<string, any> = { weather: CloudSun, search: Search, db: Database, sql: Database };
  const Icon = Object.entries(icons).find(([k]) => tool.name.includes(k))?.[1] || Wrench;
  return (
    <div className="w-full bg-accent/30 rounded-2xl border border-border/40 overflow-hidden text-xs my-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-turquoise/10 text-turquoise"><Icon className="w-4 h-4" /></div>
          <span className="font-bold uppercase tracking-widest text-[10px]">{tool.name}</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-40" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border/20 bg-background/30 p-4 space-y-3">
             <pre className="p-2 bg-muted/40 rounded-lg overflow-x-auto text-[10px] font-mono">{JSON.stringify(tool.arguments, null, 2)}</pre>
             {tool.result && <div className="p-2 bg-turquoise/5 rounded-lg border border-turquoise/10 text-[11px]">{typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2)}</div>}
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex w-full group mb-8 items-start gap-4 px-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center border shadow-sm", isUser ? "bg-coral-red border-coral-red/30 text-white" : "bg-card border-border text-turquoise")}>
        {isUser ? <span className="text-[10px] font-bold">ME</span> : <Code className="w-4 h-4" />}
      </div>
      <div className={cn("relative max-w-[85%] space-y-2", isUser ? "items-end" : "items-start")}>
        <div className={cn("px-6 py-5 rounded-[2rem] shadow-soft relative border transition-all", isUser ? "bg-coral-red/5 border-coral-red/10 rounded-tr-none" : "bg-card border-border rounded-tl-none")}>
          <div className={cn("absolute -top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10", isUser ? "right-6" : "left-6")}>
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={handleCopy}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</Button>
            {!isStreaming && <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm hover:text-destructive" onClick={() => activeSessionId && deleteMessage(activeSessionId, message.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
          </div>
          <div className={cn("prose prose-sm dark:prose-invert max-w-none", isStreaming && "after:content-['|'] after:inline-block after:animate-pulse after:text-turquoise")}>
            {!message.content && isStreaming ? (
              <div className="space-y-2 py-2"><Skeleton className="h-4 w-[250px]" /><Skeleton className="h-4 w-[200px]" /></div>
            ) : <MarkdownRenderer content={message.content} />}
          </div>
          {message.toolCalls?.map(tc => <ToolCard key={tc.id} tool={tc} />)}
        </div>
        <div className="px-3 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{formatTime(message.timestamp)}</div>
      </div>
    </motion.div>
  );
}