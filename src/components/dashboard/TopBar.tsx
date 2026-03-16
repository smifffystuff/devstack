'use client';

import { Search, Plus, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TopBar() {
  return (
    <header className="flex items-center gap-4 border-b border-border px-4 h-12 shrink-0 bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2 w-52 shrink-0">
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
          New Collection
        </Button>
        <Button size="sm" className="gap-1.5 text-xs h-8">
          <Plus className="size-3.5" />
          New Item
        </Button>
      </div>
    </header>
  );
}
