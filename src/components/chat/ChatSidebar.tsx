import React, { useEffect } from "react";
import { Sparkles, Plus, MessageSquare, Trash2, Clock } from "lucide-react";
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
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
export function ChatSidebar(): JSX.Element {
  const sessions = useChatSessions(s => s.sessions);
  const activeId = useChatSessions(s => s.activeSessionId);
  const setActive = useChatSessions(s => s.setActiveSessionId);
  const createNew = useChatSessions(s => s.createNewSession);
  const deleteSession = useChatSessions(s => s.deleteChatSession);
  const load = useChatSessions(s => s.loadSessions);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-muted-foreground italic">No conversations yet</p>
              </div>
            ) : (
              sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton 
                    onClick={() => setActive(session.id)}
                    isActive={activeId === session.id}
                    className={cn(
                      "group h-auto py-3 px-4",
                      activeId === session.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                      <div className="flex items-center gap-2 w-full">
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                        <span className="truncate font-medium text-sm">{session.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-40 text-[10px]">
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          Conversations Managed
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}