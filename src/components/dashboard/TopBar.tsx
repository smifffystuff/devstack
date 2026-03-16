'use client';

import { Search, Plus, Archive, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSidebar } from './SidebarProvider';
import { SidebarContent } from './Sidebar';

export default function TopBar() {
  const { toggle, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <header className="flex items-center gap-4 border-b border-border px-4 h-12 shrink-0 bg-background">
      {/* Sidebar toggle (desktop) */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex size-7"
        onClick={toggle}
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
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center justify-center size-7 rounded-md bg-indigo-500 text-white font-bold text-xs">
          DS
        </div>
        <span className="font-semibold text-sm text-foreground">DevStash</span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mx-auto">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-8 pr-12 h-8 bg-muted border-0 text-sm rounded-md"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ⌘ K
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Archive className="size-3.5" />
          <span className="hidden sm:inline">New Collection</span>
        </Button>
        <Button size="sm" className="gap-1.5 text-xs h-8">
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
