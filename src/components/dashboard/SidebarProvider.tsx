'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { SidebarItemType } from '@/lib/db/items';
import type { CollectionSummary } from '@/lib/db/collections';

export interface SidebarData {
  itemTypes: SidebarItemType[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
}

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
  data: SidebarData;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}

export default function SidebarProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: SidebarData;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggle, setMobileOpen, data }}>
      {children}
    </SidebarContext.Provider>
  );
}
