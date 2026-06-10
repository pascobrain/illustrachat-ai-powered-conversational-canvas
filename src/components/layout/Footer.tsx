import React from 'react';
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-background border-t border-border mt-auto py-8 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} IllustraChat. All rights reserved.</p>
          <span className="hidden md:inline">•</span>
          <p>Powered by Cloudflare Agents & AI Gateway</p>
        </div>
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-accent/50 border border-accent/20">
          <p className="text-xs font-medium text-coral-red leading-relaxed">
            Note: There is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period. Please use the tool responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}