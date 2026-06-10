import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Check, ChevronDown, Settings2, Trash, ArrowDown, Sparkles, Pencil, FileText, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { exportToText } from '@/lib/export-utils';
import { MODELS, chatService } from '@/lib/chat';
import { AnimatePresence, motion } from 'framer-motion';
export function ChatMain({ activeSessionId }: { activeSessionId: string }) {
  const messages = useChatMessages(s => s.messages);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const streamingMessage = useChatMessages(s => s.streamingMessage);
  const currentModel = useChatMessages(s => s.currentModel);
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
    if (currentModel) {
      setSelectedModel(currentModel);
    }
  }, [currentModel]);
  useEffect(() => {
    if (selectedModel && selectedModel !== currentModel) {
      chatService.updateSessionModel(activeSessionId, selectedModel);
    }
  }, [selectedModel, activeSessionId, currentModel]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
    setShowScrollBottom(!isAtBottom);
  };
  const handleRename = () => {
    if (editTitle.trim()) {
      renameSession(activeSessionId, editTitle.trim());
    }
    setIsEditingTitle(false);
  };
  return (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-sm rounded-3xl border border-border shadow-soft overflow-hidden relative">
      <div className="px-6 py-4 border-b border-border bg-background/50 flex items-center justify-between z-20">
        <div className="flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="h-9 py-1 rounded-xl"
              />
              <Button size="icon" variant="ghost" className="h-9 w-9 text-turquoise" onClick={handleRename}>
                <Check className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setEditTitle(activeSession?.title || ''); setIsEditingTitle(true); }}>
              <h3 className="font-display font-bold text-xl truncate">{activeSession?.title || 'Chat'}</h3>
              <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-all" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Settings2 className="w-4 h-4" /> <span className="hidden sm:inline">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground p-2">AI Engine</DropdownMenuLabel>
              {MODELS.map(m => (
                <DropdownMenuItem key={m.id} onClick={() => setSelectedModel(m.id)} className="rounded-xl flex justify-between items-center py-2.5 cursor-pointer">
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("text-sm", selectedModel === m.id ? "font-bold text-turquoise" : "font-medium")}>
                      {m.name}
                    </span>
                    {m.id.includes('gemini-3.1') && <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Default</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.id.includes('gemma-4') && <span className="bg-coral-red/10 text-coral-red text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>}
                    {selectedModel === m.id && <Check className="w-4 h-4 text-turquoise" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportToText(messages, activeSession?.title || 'Chat')} className="gap-2 rounded-xl cursor-pointer">
                <FileText className="w-4 h-4" /> Export MD
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => clearCurrentSession(activeSessionId)} className="gap-2 rounded-xl cursor-pointer text-destructive">
                <Trash className="w-4 h-4" /> Clear History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 md:p-8" onScrollCapture={handleScroll}>
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
          {messages.length === 0 && !isProcessing ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center animate-float">
                <Sparkles className="w-10 h-10 text-turquoise" />
              </div>
              <h4 className="text-2xl font-display font-bold">New Canvas Awaits</h4>
              <p className="text-muted-foreground text-sm max-w-xs">Powered by Gemini 3.1 Flash Lite. Describe a concept or ask for a diagram.</p>
            </div>
          ) : messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          {streamingMessage && (
            <ChatMessage message={{ id: 'streaming', role: 'assistant', content: streamingMessage, timestamp: Date.now() }} />
          )}
          {isProcessing && !streamingMessage && (
             <div className="flex items-center gap-4 text-muted-foreground ml-6">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce"></div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Thinking...</span>
             </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>
      <AnimatePresence>
        {showScrollBottom && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30">
            <Button size="icon" className="rounded-full bg-background border border-border shadow-lg" onClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}>
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