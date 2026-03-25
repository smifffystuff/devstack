'use client';

import Link from 'next/link';
import { Search, PanelLeft, Star } from 'lucide-react';
import NewItemDialog from '@/components/items/NewItemDialog';
import NewCollectionDialog from '@/components/collections/NewCollectionDialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSidebar } from './SidebarProvider';
import { SidebarContent } from './Sidebar';
import { useCommandPalette } from '@/components/search/CommandPaletteProvider';

export default function TopBar() {
  const { toggle, mobileOpen, setMobileOpen } = useSidebar();
  const { openPalette } = useCommandPalette();

  return (
    <header className="flex items-center gap-4 border-b border-border px-4 h-12 shrink-0 bg-background">
      {/* Sidebar toggle (desktop) */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex size-7"
        onClick={toggle}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-4" />
      </Button>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-7"
            />
          }
        >
          <PanelLeft className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-center size-7 rounded-md bg-indigo-500 text-white font-bold text-xs">
          DS
        </div>
        <span className="font-semibold text-sm text-foreground">DevStash</span>
      </Link>

      {/* Search — opens command palette */}
      <button
        type="button"
        onClick={openPalette}
        className="relative flex-1 max-w-sm mx-auto flex items-center gap-2 h-8 px-3 bg-muted rounded-md text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
        aria-label="Search items"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">Search items...</span>
        <kbd className="text-xs">⌘K</kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Link href="/dashboard/favorites">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Favorites"
          >
            <Star className="size-4" />
          </Button>
        </Link>
        <NewCollectionDialog />
        <NewItemDialog />
      </div>
    </header>
  );
}
