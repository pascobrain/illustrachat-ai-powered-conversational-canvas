import React, { useEffect } from "react";
import { Sparkles, Plus, MessageSquare, Trash2, Clock, RotateCcw } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
export function ChatSidebar(): JSX.Element {
  const sessions = useChatSessions(s => s.sessions);
  const activeId = useChatSessions(s => s.activeSessionId);
  const setActive = useChatSessions(s => s.setActiveSessionId);
  const createNew = useChatSessions(s => s.createNewSession);
  const deleteSession = useChatSessions(s => s.deleteChatSession);
  const clearAll = useChatSessions(s => s.clearAllSessions);
  const load = useChatSessions(s => s.loadSessions);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-coral-red to-turquoise">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">IllustraChat</span>
        </div>
        <Button
          onClick={() => createNew()}
          className="w-full btn-gradient gap-2 shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarMenu>
            {sessions.length === 0 ? (
              <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center opacity-40">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs text-muted-foreground italic max-w-[150px]">
                  Your creative journey starts here...
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => setActive(session.id)}
                    isActive={activeId === session.id}
                    className={cn(
                      "group h-auto py-3 px-4 transition-all duration-200 rounded-xl mx-2",
                      activeId === session.id 
                        ? "bg-turquoise/10 text-turquoise-foreground ring-1 ring-turquoise/20 shadow-sm" 
                        : "hover:bg-sidebar-accent"
                    )}
                  >
                    <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                      <div className="flex items-center gap-2 w-full">
                        <MessageSquare className={cn(
                          "w-4 h-4 shrink-0 transition-opacity",
                          activeId === session.id ? "opacity-100 text-turquoise" : "opacity-40"
                        )} />
                        <span className="truncate font-medium text-sm">{session.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-30 text-[10px] font-bold uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(session.lastActive, { addSuffix: true })}
                      </div>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive right-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar/50">
        {sessions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-destructive gap-2 text-xs font-bold uppercase tracking-widest px-0">
                <RotateCcw className="w-3 h-3" />
                Clear Everything
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display font-bold text-2xl">Wipe the slate clean?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-sm font-medium">
                  This will permanently delete all your conversation history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl">Keep my chats</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                  Yes, clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="mt-4 pt-4 border-t border-sidebar-border flex items-center justify-between">
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            IllustraChat v1.2
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}