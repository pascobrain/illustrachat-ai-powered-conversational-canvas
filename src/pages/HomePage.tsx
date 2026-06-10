import React, { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/chat/EmptyState';
import { ChatMain } from '@/components/chat/ChatMain';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Toaster } from '@/components/ui/sonner';
import { AlertCircle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const activeSessionId = useChatSessions(s => s.activeSessionId);
  // Simple configuration check (placeholder detection)
  const isConfigPlaceholder = useMemo(() => {
    // In a real scenario, we might check an injected window variable or a specific API endpoint
    // Here we check if the environment looks like a default setup
    return false; // Placeholder logic
  }, []);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        <div className="py-8 md:py-10 lg:py-12 flex-1 flex flex-col relative">
          <AnimatePresence>
            {isConfigPlaceholder && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="flex-1 text-sm font-medium">
                    <p>Developer Notice: Placeholder credentials detected. Update your <code className="bg-amber-500/20 px-1 rounded font-mono text-xs">wrangler.jsonc</code> for AI access.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Terminal className="w-3 h-3" />
                    Setup Required
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1 flex flex-col min-h-[calc(100vh-320px)]">
            {!activeSessionId ? (
              <EmptyState />
            ) : (
              <ChatMain activeSessionId={activeSessionId} />
            )}
          </div>
        </div>
      </div>
      <Toaster richColors position="top-right" expand={false} />
    </AppLayout>
  );
}