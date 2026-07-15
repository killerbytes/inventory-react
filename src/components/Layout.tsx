import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "./AppSidebar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow mx-auto flex flex-col min-h-screen bg-main md:m-2 md:rounded size-full relative">
        <div className="flex flex-col gap-2 md:gap-4 p-2 md:p-4">
          {children}
        </div>
        <Toaster position="bottom-left" richColors />
      </main>
    </SidebarProvider>
  );
}
