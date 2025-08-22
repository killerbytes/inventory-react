import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "./AppSidebar";

import VariantTemplateModal from "./modals/VariantTemplateModal";
import { useGlobalStore } from "@/stores/global.store";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { variantTemplateModal, setVariantTemplateModal } = useGlobalStore();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow container mx-auto flex flex-col h-screen">
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
