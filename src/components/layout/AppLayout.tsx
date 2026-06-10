import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
type AppLayoutProps = {
  children: React.ReactNode;
  contentClassName?: string;
};
export function AppLayout({ children, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <ChatSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 relative">
          <div className="absolute left-4 top-4 z-20 md:hidden">
            <SidebarTrigger />
          </div>
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 min-h-full flex flex-col" + (contentClassName ? ` ${contentClassName}` : "")}>
            {children}
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}