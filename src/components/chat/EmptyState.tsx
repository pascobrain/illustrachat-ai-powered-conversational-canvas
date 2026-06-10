import React from 'react';
import { Plus, Sparkles, Zap, Layout, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { motion } from 'framer-motion';
export function EmptyState() {
  const createNew = useChatSessions(s => s.createNewSession);
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-turquoise/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-coral-red/5 blur-[100px] rounded-full" />
      </div>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-12"
      >
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-white to-muted rounded-[2.5rem] shadow-soft border border-border flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-coral-red/5 to-turquoise/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Terminal className="w-32 h-32 text-turquoise/20 absolute -bottom-4 -left-4 rotate-12" />
            <Sparkles className="w-32 h-32 text-coral-red/10 absolute -top-4 -right-4 -rotate-12" />
            <img
              src="https://placehold.co/400x400/transparent/4ecdc4/png?text=✨"
              alt="Illustrative AI"
              className="w-32 h-32 relative z-10 drop-shadow-2xl"
            />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-6 -right-6 bg-white dark:bg-zinc-800 p-4 rounded-3xl shadow-glow z-20 border border-coral-red/20"
          >
            <Sparkles className="w-10 h-10 text-coral-red" />
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="max-w-2xl space-y-6">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight"
        >
          Your Creative <span className="text-illustrative-gradient">Canvas</span>
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-xl leading-relaxed max-w-lg mx-auto font-medium"
        >
          The next-gen conversation interface where ideas turn into visual diagrams and clean code in seconds.
        </motion.p>
      </div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl"
      >
        {[
          { icon: Zap, title: 'Instant Flow', desc: 'Real-time response streaming', color: 'bg-coral-red/10 text-coral-red' },
          { icon: Layout, title: 'Visual Logic', desc: 'Dynamic Mermaid diagrams', color: 'bg-turquoise/10 text-turquoise' },
          { icon: Terminal, title: 'Code Ready', desc: 'Full syntax highlighting', color: 'bg-amber-500/10 text-amber-600' }
        ].map((feat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border shadow-soft flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
            <div className={cn("p-3 rounded-2xl", feat.color)}>
              <feat.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-sm">{feat.title}</h4>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{feat.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16"
      >
        <Button
          onClick={() => createNew()}
          size="lg"
          className="btn-gradient h-16 px-10 text-xl rounded-[2rem] shadow-glow-lg hover:scale-105 active:scale-95 transition-all group"
        >
          <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
          Create New Conversation
        </Button>
      </motion.div>
    </div>
  );
}