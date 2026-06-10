import React from 'react';
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-background/50 border-t border-border mt-auto py-10 text-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm font-medium text-muted-foreground">
          <p>© {currentYear} IllustraChat</p>
          <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
          <p className="hover:text-turquoise cursor-default transition-colors">Privacy Policy</p>
          <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
          <p className="hover:text-coral-red cursor-default transition-colors">Terms of Service</p>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-4 rounded-2xl bg-accent/30 border border-accent/20 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-coral-red/80 mb-1">
            Global Usage Notice
          </p>
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            IllustraChat is an AI-powered tool. Request limits are enforced across all connected instances to ensure equitable performance. Please use the conversational canvas responsibly.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] uppercase font-bold tracking-tighter opacity-20 group">
          <span>v1.2.0 Production</span>
          <div className="w-2 h-2 rounded-full bg-turquoise group-hover:animate-ping" />
          <span>Cloudflare Edge Optimized</span>
        </div>
      </div>
    </footer>
  );
}