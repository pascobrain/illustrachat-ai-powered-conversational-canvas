import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-accent text-muted-foreground transition-colors" />
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <div className="bg-gradient-to-br from-coral-red to-turquoise p-1.5 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-illustrative-gradient hidden sm:inline">
              IllustraChat
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle className="relative top-0 right-0" />
        </div>
      </div>
    </header>
  );
}