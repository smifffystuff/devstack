'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import CommandPalette from './CommandPalette';

interface CommandPaletteContextValue {
  openPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return ctx;
}

export default function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  return (
    <CommandPaletteContext value={{ openPalette }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext>
  );
}
