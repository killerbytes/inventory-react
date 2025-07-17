import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useApiData, type ApiDataType } from "@/hooks/useApiData";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "./AppSidebar";

import { UserContext } from "./UserContext";
import User from "./User";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const props: ApiDataType = useApiData();

  return (
    <SidebarProvider>
      <div>
        <AppSidebar />
      </div>

      <main className="flex-grow container mx-auto flex flex-col h-screen">
        <div className="flex justify-between items-center bg-foreground text-background p-4 h-16 mb-4">
          <SidebarTrigger />
          <UserContext.Provider value={props}>
            <User />
          </UserContext.Provider>
        </div>
        <div className="px-4 flex flex-col h-full ">{children}</div>
        {/* <footer className="bg-foreground text-background py-4 text-center mt-auto">
          &copy; {new Date().getFullYear()} My Hardware. All rights reserved.
        </footer> */}
      </main>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
