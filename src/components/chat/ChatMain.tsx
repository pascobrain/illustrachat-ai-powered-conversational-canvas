import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import {
  Check, X, ChevronDown, Settings2, Trash, ArrowDown, Sparkles, Layout, Zap, Pencil, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { exportToText } from '@/lib/export-utils';
import { MODELS } from '@/lib/chat';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
interface ChatMainProps {
  activeSessionId: string;
}
export function ChatMain({ activeSessionId }: ChatMainProps) {
  // STRICT ZUSTAND SELECTORS - MULTIPLE PRIMITIVE CALLS
  const messages = useChatMessages(s => s.messages);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const streamingMessage = useChatMessages(s => s.streamingMessage);
  const loadMessages = useChatMessages(s => s.loadMessages);
  const clearCurrentSession = useChatMessages(s => s.clearCurrentSession);
  const sessions = useChatSessions(s => s.sessions);
  const renameSession = useChatSessions(s => s.renameSession);
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadMessages(activeSessionId);
    setIsEditingTitle(false);
  }, [activeSessionId, loadMessages]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setShowScrollBottom(!isAtBottom);
  };
  const handleRename = () => {
    if (editTitle.trim() && activeSession) {
      renameSession(activeSession.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };
  return (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-sm rounded-3xl border border-border shadow-soft overflow-hidden relative">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border bg-background/50 flex items-center justify-between z-20">
        <div className="flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                className="h-9 py-1 rounded-xl focus-visible:ring-turquoise"
              />
              <Button size="icon" variant="ghost" className="h-9 w-9 text-turquoise hover:bg-turquoise/10" onClick={handleRename}>
                <Check className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => setIsEditingTitle(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {
              setEditTitle(activeSession?.title || '');
              setIsEditingTitle(true);
            }}>
              <h3 className="font-display font-bold text-xl truncate tracking-tight">
                {activeSession?.title || 'Loading...'}
              </h3>
              <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-all text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border bg-background/50 hover:bg-background">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-2">AI Model</DropdownMenuLabel>
              {MODELS.map(m => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className="rounded-xl flex items-center justify-between py-2 cursor-pointer"
                >
                  <span className={selectedModel === m.id ? "font-bold text-turquoise" : ""}>{m.name}</span>
                  {selectedModel === m.id && <Check className="w-4 h-4 text-turquoise" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-2">Export & Safety</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportToText(messages, activeSession?.title || 'Chat')} className="gap-2 rounded-xl cursor-pointer">
                <FileText className="w-4 h-4" /> Export MD
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => clearCurrentSession(activeSessionId)} className="gap-2 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash className="w-4 h-4" /> Clear History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 md:p-8" onScrollCapture={handleScroll}>
        <div id="chat-messages-container" className="space-y-8 max-w-4xl mx-auto pb-12">
          {messages.length === 0 && !isProcessing ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center border border-border animate-float">
                <Sparkles className="w-10 h-10 text-turquoise" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-display font-bold">What's on your mind?</h4>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                  Try asking for a system diagram, a creative story, or help with code.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                <Button variant="outline" className="rounded-2xl h-auto py-3 px-4 flex flex-col items-start gap-1 text-left border-border/60 hover:bg-turquoise/5 hover:border-turquoise/30" onClick={() => toast.info("Coming soon!")}>
                  <Layout className="w-4 h-4 text-turquoise" />
                  <span className="text-xs font-bold uppercase tracking-tight">Mermaid Flowchart</span>
                  <span className="text-[10px] text-muted-foreground">Draw a user login process</span>
                </Button>
                <Button variant="outline" className="rounded-2xl h-auto py-3 px-4 flex flex-col items-start gap-1 text-left border-border/60 hover:bg-coral-red/5 hover:border-coral-red/30" onClick={() => toast.info("Coming soon!")}>
                  <Zap className="w-4 h-4 text-coral-red" />
                  <span className="text-xs font-bold uppercase tracking-tight">Rapid Code</span>
                  <span className="text-[10px] text-muted-foreground">Write a React hook for API</span>
                </Button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
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
            <div className="flex items-center gap-4 text-muted-foreground ml-6">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce"></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Dreaming...</span>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>
      <AnimatePresence>
        {showScrollBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30"
          >
            <Button
              size="icon"
              className="rounded-full bg-background border border-border shadow-lg hover:bg-accent text-foreground w-10 h-10"
              onClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ArrowDown className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-6 bg-background/50 border-t border-border/60">
        <ChatInput activeSessionId={activeSessionId} model={selectedModel} />
      </div>
    </div>
  );
}