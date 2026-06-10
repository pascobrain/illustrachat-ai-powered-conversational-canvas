import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  contentClassName?: string;
};
export function AppLayout({ children, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-sans selection:bg-turquoise/20 overflow-hidden relative">
        {/* Illustrative Background Layer */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-red/5 blur-[120px] rounded-full opacity-40 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-turquoise/5 blur-[150px] rounded-full opacity-40 animate-pulse" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 blur-[100px] rounded-full opacity-20" />
          {/* Grain Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
        <ChatSidebar />
        <SidebarInset className="flex flex-col flex-1 min-h-screen overflow-x-hidden bg-transparent z-10">
          <Header />
          <main className="flex-1 relative flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
              <div className={cn(
                "py-8 md:py-10 lg:py-12 flex-1 flex flex-col w-full",
                contentClassName
              )}>
                {children}
              </div>
            </div>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}