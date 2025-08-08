import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useApiData, type ApiDataType } from "@/hooks/useApiData";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "./AppSidebar";

import VariantTemplateModal from "./VariantTemplateModal";
import { useGlobalStore } from "@/stores/global.store";
import { UserContext } from "./UserContext";
import User from "./User";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const props: ApiDataType = useApiData();
  const { variantTemplateModal, setVariantTemplateModal } = useGlobalStore();

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
        {variantTemplateModal && (
          <VariantTemplateModal
            isOpen={true}
            onClose={() => setVariantTemplateModal(false)}
          />
        )}
      </main>
      <Toaster position="bottom-left" richColors />
    </SidebarProvider>
  );
}
