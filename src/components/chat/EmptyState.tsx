import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Zap, Layout, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
export function EmptyState() {
  const createNew = useChatSessions(s => s.createNewSession);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      <motion.div style={{ x: springX, y: springY }} className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-turquoise/5 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-coral-red/5 blur-[100px] rounded-full opacity-60" />
      </motion.div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-12">
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-48 h-48 md:w-64 md:h-64 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-soft border border-border flex items-center justify-center relative group">
          <Sparkles className="w-24 h-24 text-turquoise/20 group-hover:text-turquoise/40 transition-colors" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border border-dashed border-turquoise/20 rounded-full" />
        </motion.div>
      </motion.div>
      <div className="max-w-2xl space-y-6 z-10">
        <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-6xl md:text-7xl font-display font-bold tracking-tight">
          Creative <span className="text-illustrative-gradient">Canvas</span>
        </motion.h2>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-xl max-w-lg mx-auto font-medium">
          A conversational hub where code, diagrams, and ideas come to life.
        </motion.p>
      </div>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
        {[
          { icon: Zap, title: 'Streaming', color: 'text-coral-red' },
          { icon: Layout, title: 'Diagrams', color: 'text-turquoise' },
          { icon: Terminal, title: 'Logic', color: 'text-amber-500' }
        ].map((feat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="p-6 rounded-3xl bg-card/40 backdrop-blur-sm border border-border shadow-soft">
            <feat.icon className={cn("w-6 h-6 mx-auto mb-3", feat.color)} />
            <h4 className="font-display font-bold text-sm">{feat.title}</h4>
          </motion.div>
        ))}
      </motion.div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-16">
        <Button onClick={() => createNew()} size="lg" className="btn-gradient h-16 px-10 text-xl rounded-full shadow-glow-lg group">
          <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
          Start New Dialogue
        </Button>
      </motion.div>
    </div>
  );
}