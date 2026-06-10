import React, { useEffect, useState } from "react";
import { Sparkles, Plus, MessageSquare, Trash2, Clock, RotateCcw, Pencil, Check, X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
export function ChatSidebar(): JSX.Element {
  const sessions = useChatSessions(s => s.sessions);
  const activeId = useChatSessions(s => s.activeSessionId);
  const setActive = useChatSessions(s => s.setActiveSessionId);
  const createNew = useChatSessions(s => s.createNewSession);
  const deleteSession = useChatSessions(s => s.deleteChatSession);
  const clearAll = useChatSessions(s => s.clearAllSessions);
  const renameSession = useChatSessions(s => s.renameSession);
  const load = useChatSessions(s => s.loadSessions);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  useEffect(() => {
    load();
  }, [load]);
  const handleStartRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };
  const handleConfirmRename = () => {
    if (editingId && editTitle.trim()) {
      renameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
  };
  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className={cn("p-4 border-b border-sidebar-border bg-sidebar/50", isCollapsed && "items-center")}>
        <div className="flex items-center gap-3 mb-4 group cursor-default">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-coral-red to-turquoise shrink-0 shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && <span className="font-display font-bold text-lg truncate">IllustraChat</span>}
        </div>
        <Button
          onClick={() => createNew()}
          className={cn(
            "btn-gradient shadow-soft hover:opacity-90 active:scale-95 transition-all",
            isCollapsed ? "w-10 h-10 p-0" : "w-full gap-2"
          )}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Session</span>}
        </Button>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar/30">
        <SidebarGroup>
          <SidebarMenu>
            {sessions.length === 0 ? (
              !isCollapsed && (
                <div className="px-4 py-16 text-center flex flex-col items-center gap-3 opacity-40">
                  <MessageSquare className="w-8 h-8" />
                  <p className="text-[10px] font-bold uppercase tracking-widest max-w-[150px]">Canvas Empty</p>
                </div>
              )
            ) : (
              sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  {editingId === session.id ? (
                    <div className="px-4 py-2 flex items-center gap-2">
                      <Input 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                        className="h-8 py-0 px-2 text-sm rounded-lg"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-turquoise" onClick={handleConfirmRename}><Check className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => setActive(session.id)}
                      isActive={activeId === session.id}
                      className={cn(
                        "group h-auto py-3 px-4 transition-all duration-300 rounded-xl mx-2 relative overflow-hidden",
                        activeId === session.id
                          ? "bg-turquoise/10 text-turquoise-foreground ring-1 ring-turquoise/20 shadow-[0_0_15px_rgba(78,205,196,0.1)]"
                          : "hover:bg-sidebar-accent",
                        isCollapsed && "justify-center p-2 mx-0"
                      )}
                      tooltip={session.title}
                    >
                      {activeId === session.id && (
                        <motion.div layoutId="active-glow" className="absolute inset-0 bg-gradient-to-r from-turquoise/5 to-transparent pointer-events-none" />
                      )}
                      <div className={cn("flex flex-col items-start gap-1 w-full overflow-hidden relative z-10", isCollapsed && "items-center")}>
                        <div className={cn("flex items-center gap-2 w-full", isCollapsed && "justify-center")}>
                          <MessageSquare className={cn(
                            "w-4 h-4 shrink-0 transition-all",
                            activeId === session.id ? "text-turquoise scale-110" : "opacity-30"
                          )} />
                          {!isCollapsed && <span className={cn("truncate text-sm transition-colors", activeId === session.id ? "font-bold" : "font-medium opacity-70")}>{session.title}</span>}
                        </div>
                        {!isCollapsed && (
                          <span className="text-[9px] opacity-30 font-bold uppercase tracking-tighter">
                            {formatDistanceToNow(session.lastActive, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  )}
                  {!isCollapsed && editingId !== session.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <SidebarMenuAction onClick={() => handleStartRename(session.id, session.title)} className="hover:text-turquoise">
                        <Pencil className="w-3.5 h-3.5" />
                      </SidebarMenuAction>
                      <SidebarMenuAction onClick={() => deleteSession(session.id)} className="hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </SidebarMenuAction>
                    </div>
                  )}
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("p-4 border-t border-sidebar-border bg-sidebar/50", isCollapsed && "items-center")}>
        {!isCollapsed && sessions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-destructive gap-2 text-[10px] font-bold uppercase tracking-widest px-0">
                <RotateCcw className="w-3 h-3" /> Reset Environment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-border bg-background/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display font-bold text-2xl">Delete all data?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-medium">
                  This action clears your entire conversation history across all sessions. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                  Yes, clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className={cn("mt-4 pt-4 border-t border-sidebar-border flex items-center justify-between w-full opacity-30", isCollapsed && "justify-center")}>
           {!isCollapsed && (
             <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-widest font-bold">Illustra v1.2.0</span>
               <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
                  <span className="text-[8px] font-bold uppercase">Production Ready</span>
               </div>
             </div>
           )}
           {isCollapsed && <div className="w-2 h-2 rounded-full bg-turquoise/40" />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}