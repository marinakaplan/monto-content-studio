"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar } from "@/components/sidebar";

const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className="transition-all duration-200 min-h-screen"
        style={{ marginLeft: collapsed ? 60 : 220 }}
      >
        {children}
      </main>
    </SidebarContext.Provider>
  );
}
