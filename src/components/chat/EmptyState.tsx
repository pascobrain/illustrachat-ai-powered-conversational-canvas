import React from 'react';
import { Plus, Sparkles, Zap, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatSessions } from '@/hooks/use-chat-sessions';
export function EmptyState() {
  const createNew = useChatSessions(s => s.createNewSession);
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in my-auto">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-turquoise/20 blur-3xl rounded-full scale-150"></div>
        <img 
          src="https://placehold.co/400x300/f8f9fa/4ecdc4/svg?text=Hello+I'm+IllustraChat" 
          alt="Illustrative AI character" 
          className="relative w-full max-w-sm drop-shadow-xl rounded-3xl"
        />
        <div className="absolute -top-4 -right-4 bg-white dark:bg-card p-3 rounded-2xl shadow-glow floating">
          <Sparkles className="w-8 h-8 text-coral-red" />
        </div>
      </div>
      <div className="max-w-md space-y-4">
        <h2 className="text-4xl font-display font-bold text-foreground">
          Your Creative <span className="text-illustrative-gradient">Canvas</span> Awaits
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Start a conversation to generate ideas, write code, or create stunning Mermaid diagrams with ease.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full max-w-2xl">
        {[
          { icon: Zap, text: 'Fast Generation', color: 'text-coral-red' },
          { icon: Layout, text: 'Mermaid Diagrams', color: 'text-turquoise' },
          { icon: Sparkles, text: 'Gemini Powered', color: 'text-amber-500' }
        ].map((feat, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col items-center gap-2">
            <feat.icon className={`w-5 h-5 ${feat.color}`} />
            <span className="text-xs font-bold uppercase tracking-tight">{feat.text}</span>
          </div>
        ))}
      </div>
      <Button 
        onClick={() => createNew()}
        size="lg"
        className="mt-10 btn-gradient h-14 px-8 text-lg rounded-2xl shadow-glow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5 mr-2" />
        Start New Conversation
      </Button>
    </div>
  );
}