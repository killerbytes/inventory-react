import React from "react";
import Header from "./Header";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto p-4 flex flex-col">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-4 text-center">
        &copy; {new Date().getFullYear()} My Hardware. All rights reserved.
      </footer>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
