import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Check, ChevronDown, Settings2, Trash, ArrowDown, Sparkles, Pencil, FileText, ImageIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { exportToText, exportToImage } from '@/lib/export-utils';
import { MODELS, chatService } from '@/lib/chat';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
export function ChatMain({ activeSessionId }: { activeSessionId: string }) {
  const messages = useChatMessages(s => s.messages);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const streamingMessage = useChatMessages(s => s.streamingMessage);
  const currentModel = useChatMessages(s => s.currentModel);
  const loadMessages = useChatMessages(s => s.loadMessages);
  const clearCurrentSession = useChatMessages(s => s.clearCurrentSession);
  const sendMessage = useChatMessages(s => s.sendMessage);
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
    if (currentModel) setSelectedModel(currentModel);
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
    if (editTitle.trim()) renameSession(activeSessionId, editTitle.trim());
    setIsEditingTitle(false);
  };
  const handleExportImage = async () => {
    const promise = exportToImage("chat-capture-area", activeSession?.title || "Chat");
    toast.promise(promise, {
      loading: 'Preparing canvas for export...',
      success: 'Export successful!',
      error: 'Failed to capture canvas.'
    });
  };
  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) sendMessage(activeSessionId, lastUserMsg.content, selectedModel);
  };
  return (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-md rounded-3xl border border-border shadow-soft overflow-hidden relative group/chat">
      <div className="px-6 py-4 border-b border-border bg-background/50 flex items-center justify-between z-20 backdrop-blur-xl">
        <div className="flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditingTitle(false); }}
                autoFocus
                className="h-9 py-1 rounded-xl focus-visible:ring-turquoise/30"
              />
              <Button size="icon" variant="ghost" className="h-9 w-9 text-turquoise" onClick={handleRename}><Check className="w-5 h-5" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group/title cursor-pointer" onClick={() => { setEditTitle(activeSession?.title || ''); setIsEditingTitle(true); }}>
              <h3 className="font-display font-bold text-xl truncate">{activeSession?.title || 'Chat'}</h3>
              <Pencil className="w-4 h-4 opacity-0 group-hover/title:opacity-40 transition-all text-turquoise" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-turquoise/10 border border-turquoise/20">
                <div className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
                <span className="text-[10px] font-bold text-turquoise uppercase tracking-widest">Active</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl hover:bg-turquoise/5 hover:text-turquoise transition-colors">
                <Settings2 className="w-4 h-4" /> <span className="hidden sm:inline">Engine</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground p-2">Select Model</DropdownMenuLabel>
              {MODELS.map(m => (
                <DropdownMenuItem 
                  key={m.id} 
                  onClick={() => { setSelectedModel(m.id); toast.success(`Switched to ${m.name}`); }} 
                  className={cn("rounded-xl flex justify-between items-center py-3 cursor-pointer", selectedModel === m.id && "bg-turquoise/5")}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("text-sm transition-colors", selectedModel === m.id ? "font-bold text-turquoise" : "font-medium")}>{m.name}</span>
                    {m.id.includes('gemini-3.1') && <span className="text-[9px] text-muted-foreground font-bold">Standard</span>}
                  </div>
                  {selectedModel === m.id && <Check className="w-4 h-4 text-turquoise" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportToText(messages, activeSession?.title || 'Chat')} className="gap-2 rounded-xl py-2.5 cursor-pointer"><FileText className="w-4 h-4" /> Export Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportImage} className="gap-2 rounded-xl py-2.5 cursor-pointer"><ImageIcon className="w-4 h-4" /> Export Canvas (PNG)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => clearCurrentSession(activeSessionId)} className="gap-2 rounded-xl py-2.5 cursor-pointer text-destructive focus:bg-destructive/10"><Trash className="w-4 h-4" /> Clear History</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 md:p-8 overflow-x-hidden" onScrollCapture={handleScroll}>
        <div id="chat-capture-area" className="space-y-8 max-w-4xl mx-auto pb-12 transition-all">
          {messages.length === 0 && !isProcessing ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center animate-float">
                <Sparkles className="w-10 h-10 text-turquoise" />
              </div>
              <h4 className="text-2xl font-display font-bold">Ready for Inspiration</h4>
              <p className="text-muted-foreground text-sm max-w-xs">Ask for a system diagram or explain a complex piece of code.</p>
            </div>
          ) : messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          {streamingMessage && (
            <ChatMessage message={{ id: 'streaming', role: 'assistant', content: streamingMessage, timestamp: Date.now() }} />
          )}
          {isProcessing && !streamingMessage && (
             <div className="flex items-center gap-4 text-muted-foreground ml-6">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-turquoise animate-bounce" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Architecting...</span>
             </div>
          )}
          {!isProcessing && messages.length > 0 && messages[messages.length-1].content.includes("error") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-md p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wide">Issue Detected</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleRetryLast} className="gap-2 h-8 text-xs font-bold border-destructive/20 hover:bg-destructive/10">
                <RefreshCw className="w-3 h-3" /> Retry Prompt
              </Button>
            </motion.div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>
      <AnimatePresence>
        {showScrollBottom && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30">
            <Button size="icon" className="rounded-full bg-background border border-border shadow-lg hover:text-turquoise" onClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <ArrowDown className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-6 bg-background/50 border-t border-border/60 backdrop-blur-sm">
        <ChatInput activeSessionId={activeSessionId} model={selectedModel} />
      </div>
    </div>
  );
}