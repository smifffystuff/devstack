'use client';

import Link from 'next/link';
import { Search, PanelLeft, Star, Plus, FolderPlus, Sparkles } from 'lucide-react';
import NewItemDialog from '@/components/items/NewItemDialog';
import NewCollectionDialog from '@/components/collections/NewCollectionDialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from './SidebarProvider';
import { SidebarContent } from './Sidebar';
import { useCommandPalette } from '@/components/search/CommandPaletteProvider';
import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  isPro: boolean;
}

export default function TopBar({ isPro }: TopBarProps) {
  const { toggle, mobileOpen, setMobileOpen } = useSidebar();
  const { openPalette } = useCommandPalette();
  const router = useRouter();
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const sheetTriggerId = useId();

  return (
    <header className="flex items-center gap-2 md:gap-4 border-b border-border px-4 h-12 shrink-0 bg-background">
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
              id={sheetTriggerId}
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
        <svg
          className="w-5 h-5 text-blue-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7h16M4 12h16M4 17h10" />
          <circle cx="19" cy="17" r="3" />
        </svg>
        <span className="font-semibold text-sm text-foreground">DevStash</span>
      </Link>

      {/* Search — icon-only on mobile, full pill on desktop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={openPalette}
        className="md:hidden size-8 text-muted-foreground"
        aria-label="Search items"
      >
        <Search className="size-4" />
      </Button>
      <button
        type="button"
        onClick={openPalette}
        className="hidden md:flex relative flex-1 max-w-sm mx-auto items-center gap-2 h-8 px-3 bg-muted rounded-md text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
        aria-label="Search items"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">Search items...</span>
        <kbd className="text-xs">⌘K</kbd>
      </button>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-2 ml-auto">
        {!isPro && (
          <Link href="/dashboard/upgrade">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <Sparkles className="size-3.5" />
              Upgrade
            </Button>
          </Link>
        )}
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
        <NewItemDialog isPro={isPro} />
      </div>

      {/* Mobile overflow menu */}
      <div className="md:hidden ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="More actions"
          >
            <Plus className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setNewItemOpen(true)}>
              <Plus className="size-4 mr-2" />
              New Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNewCollectionOpen(true)}>
              <FolderPlus className="size-4 mr-2" />
              New Collection
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/favorites')}>
              <Star className="size-4 mr-2" />
              Favorites
            </DropdownMenuItem>
            {!isPro && (
              <DropdownMenuItem onClick={() => router.push('/dashboard/upgrade')}>
                <Sparkles className="size-4 mr-2" />
                Upgrade
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialogs controlled by mobile overflow menu */}
        <NewCollectionDialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen} />
        <NewItemDialog isPro={isPro} open={newItemOpen} onOpenChange={setNewItemOpen} />
      </div>
    </header>
  );
}
