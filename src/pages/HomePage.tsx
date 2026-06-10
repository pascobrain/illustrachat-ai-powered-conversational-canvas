import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/chat/EmptyState';
import { ChatMain } from '@/components/chat/ChatMain';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  const activeSessionId = useChatSessions(s => s.activeSessionId);
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col min-h-[calc(100vh-250px)]">
        {!activeSessionId ? (
          <EmptyState />
        ) : (
          <ChatMain activeSessionId={activeSessionId} />
        )}
      </div>
      <Toaster richColors position="top-right" />
    </AppLayout>
  );
}