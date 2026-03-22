"use client";

import { createContext, useContext, useState, useCallback } from "react";
import ItemDrawer from "./ItemDrawer";

interface ItemDrawerContextValue {
  openItem: (id: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  return ctx;
}

export default function ItemDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const openItem = useCallback((id: string) => setSelectedItemId(id), []);
  const closeItem = useCallback(() => setSelectedItemId(null), []);

  return (
    <ItemDrawerContext value={{ openItem }}>
      {children}
      <ItemDrawer itemId={selectedItemId} onClose={closeItem} />
    </ItemDrawerContext>
  );
}
