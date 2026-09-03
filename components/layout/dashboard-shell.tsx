"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Sidebar } from "./sidebar";

interface MobileMenuContextValue {
  openMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  return { openMobileMenu: ctx?.openMobileMenu ?? (() => {}) };
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobileMenu = useCallback(() => setMobileOpen(true), []);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileMenuContext.Provider value={{ openMobileMenu }}>
          {children}
        </MobileMenuContext.Provider>
      </div>
    </div>
  );
}
