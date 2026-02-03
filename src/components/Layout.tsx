import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "./AppSidebar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow mx-auto flex flex-col h-screen bg-background md:m-2 rounded size-full relative">
        <div className="flex flex-col h-full md:m-2">
          {children}
          <Toaster position="bottom-left" richColors />
        </div>
      </main>
    </SidebarProvider>
  );
}
