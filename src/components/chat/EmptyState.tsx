import React, { useEffect } from 'react';
import { Plus, Sparkles, Zap, Layout, Terminal, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
const SUGGESTIONS = [
  { icon: Terminal, label: "React login form with Tailwind", prompt: "Create a modern React login form using Tailwind CSS with glassmorphism." },
  { icon: Layout, label: "System architecture diagram", prompt: "Draw a Mermaid diagram for a microservices architecture with an API Gateway and Auth service." },
  { icon: Zap, label: "Optimize SQL query performance", prompt: "Explain how to optimize a slow SQL JOIN query with 1 million records." }
];
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
  const handleQuickStart = (prompt: string) => {
    createNew(prompt);
  };
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      <motion.div style={{ x: springX, y: springY }} className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-turquoise/5 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-coral-red/5 blur-[100px] rounded-full opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full opacity-30" />
      </motion.div>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="relative mb-10"
      >
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
          className="w-40 h-40 md:w-56 md:h-56 bg-card rounded-[3rem] shadow-soft border border-border flex items-center justify-center relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-coral-red/5 to-turquoise/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-20 h-20 text-turquoise/20 group-hover:text-turquoise/40 transition-all duration-700 group-hover:scale-110" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 border border-dashed border-turquoise/10 rounded-full" />
        </motion.div>
      </motion.div>
      <div className="max-w-4xl space-y-6 z-10 mb-12">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-5xl md:text-7xl font-display font-bold tracking-tight"
        >
          IllustraChat <span className="text-illustrative-gradient">Canvas</span>
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }} 
          className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto font-medium"
        >
          Where whimsical design meets professional AI logic. Start your journey below.
        </motion.p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl z-10">
        {SUGGESTIONS.map((item, i) => (
          <motion.button
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => handleQuickStart(item.prompt)}
            className="group p-5 rounded-3xl bg-card/60 backdrop-blur-md border border-border/50 shadow-soft text-left flex flex-col justify-between h-40 hover:border-turquoise/30 transition-all"
          >
            <div className="p-2 rounded-xl bg-accent w-fit mb-3 group-hover:bg-turquoise/10 group-hover:text-turquoise transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-turquoise transition-colors">Quick Start</p>
              <h4 className="font-display font-bold text-sm leading-tight text-foreground/80">{item.label}</h4>
            </div>
            <ArrowRight className="w-4 h-4 self-end opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-turquoise" />
          </motion.button>
        ))}
      </div>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 0.6 }} 
        className="mt-16"
      >
        <Button onClick={() => createNew()} size="lg" className="btn-gradient h-14 px-10 text-lg rounded-full shadow-glow-lg group active:scale-95 transition-transform">
          <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
          New Dialogue
        </Button>
      </motion.div>
    </div>
  );
}