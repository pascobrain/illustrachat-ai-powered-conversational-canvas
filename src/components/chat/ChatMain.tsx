import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Loader2, Download, FileText, ImageIcon, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { exportToText, exportToImage } from '@/lib/export-utils';
import { toast } from 'sonner';
interface ChatMainProps {
  activeSessionId: string;
}
export function ChatMain({ activeSessionId }: ChatMainProps) {
  const messages = useChatMessages(s => s.messages);
  const isProcessing = useChatMessages(s => s.isProcessing);
  const streamingMessage = useChatMessages(s => s.streamingMessage);
  const loadMessages = useChatMessages(s => s.loadMessages);
  const sessions = useChatSessions(s => s.sessions);
  const renameSession = useChatSessions(s => s.renameSession);
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
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
  const handleRename = () => {
    if (editTitle.trim() && activeSession) {
      renameSession(activeSession.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };
  const handleExportText = () => {
    if (!activeSession) return;
    exportToText(messages, activeSession.title);
    toast.success("Chat exported as Markdown");
  };
  const handleExportImage = async () => {
    if (!activeSession) return;
    setIsExporting(true);
    try {
      await exportToImage('chat-messages-container', activeSession.title);
      toast.success("Chat exported as Image");
    } catch (e) {
      toast.error("Failed to export image");
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border bg-background/50 flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 max-w-md">
              <Input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                className="h-8 py-1"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-turquoise" onClick={handleRename}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setIsEditingTitle(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
              setEditTitle(activeSession?.title || '');
              setIsEditingTitle(true);
            }}>
              <h3 className="font-display font-bold text-lg truncate">
                {activeSession?.title || 'Loading...'}
              </h3>
              <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl" disabled={messages.length === 0 || isExporting}>
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1">
              <DropdownMenuItem onClick={handleExportText} className="gap-2 rounded-lg cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Text (Markdown)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportImage} className="gap-2 rounded-lg cursor-pointer">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Image (PNG)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div id="chat-messages-container" className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
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
            <div className="flex items-center gap-3 text-muted-foreground animate-pulse ml-4">
              <Loader2 className="w-4 h-4 animate-spin text-turquoise" />
              <span className="text-sm font-medium">IllustraChat is thinking...</span>
            </div>
          )}
          <div ref={scrollRef} className="h-1" />
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/50 border-t border-border">
        <ChatInput activeSessionId={activeSessionId} />
      </div>
    </div>
  );
}