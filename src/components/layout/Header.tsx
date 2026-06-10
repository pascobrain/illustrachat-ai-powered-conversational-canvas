import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/70 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-accent text-muted-foreground transition-all active:scale-90" />
          <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 group">
            <div className="bg-gradient-to-br from-coral-red to-turquoise p-1.5 rounded-xl shadow-soft group-hover:rotate-12 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-display font-bold text-illustrative-gradient hidden sm:inline leading-none">
                IllustraChat
              </span>
              <span className="text-[9px] font-bold uppercase tracking-tighter opacity-30 hidden sm:inline">Conversational Canvas</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-2xl bg-accent/30 border border-border/40 mr-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help group">
                    <div className="relative">
                      <Globe className="w-4 h-4 text-turquoise group-hover:animate-spin-slow" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-turquoise border border-background" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">AI Gateway</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl border-border bg-background/95 backdrop-blur-xl">
                  <p className="text-xs font-bold text-turquoise">Connection Healthy</p>
                  <p className="text-[10px] text-muted-foreground">Optimized for Gemini 3.1 & Gemma 4</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help group">
                    <ShieldCheck className="w-4 h-4 text-coral-red group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl border-border bg-background/95 backdrop-blur-xl">
                  <p className="text-xs font-bold text-coral-red">TLS 1.3 Encryption</p>
                  <p className="text-[10px] text-muted-foreground">End-to-end secure persistence</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ThemeToggle className="relative top-0 right-0 shadow-soft" />
        </div>
      </div>
    </header>
  );
}