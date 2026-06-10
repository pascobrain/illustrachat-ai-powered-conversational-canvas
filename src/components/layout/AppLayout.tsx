import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
      <div className="flex min-h-screen w-full bg-background font-sans selection:bg-turquoise/20">
        <ChatSidebar />
        <SidebarInset className="flex flex-col flex-1 min-h-screen overflow-x-hidden">
          <Header />
          <main className="flex-1 relative flex flex-col">
            <div className="absolute left-4 top-4 z-50 md:hidden">
              <SidebarTrigger className="bg-background shadow-md border border-border h-10 w-10 rounded-xl" />
            </div>
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