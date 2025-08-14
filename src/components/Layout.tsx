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
      <AppSidebar />

      <main className="flex-grow container mx-auto flex flex-col h-screen">
        {/* <div>
          <SidebarTrigger />
        </div> */}
        <div className="flex flex-col h-full m-2">
          {children}

          {variantTemplateModal && (
            <VariantTemplateModal
              isOpen={true}
              onClose={() => setVariantTemplateModal(false)}
            />
          )}
          <Toaster position="bottom-left" richColors />
        </div>
      </main>
    </SidebarProvider>
  );
}
