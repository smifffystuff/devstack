'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderOpen } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { ICON_MAP } from '@/lib/item-type-icons';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import type { SearchData, SearchItem, SearchCollection } from '@/lib/db/search';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [data, setData] = useState<SearchData | null>(null);
  const router = useRouter();
  const { openItem } = useItemDrawer();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/search');
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silently fail
    }
  }, []);

  // Pre-fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch when opening to get fresh data
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  function handleSelectItem(item: SearchItem) {
    onOpenChange(false);
    openItem(item.id);
  }

  function handleSelectCollection(collection: SearchCollection) {
    onOpenChange(false);
    router.push(`/dashboard/collections/${collection.id}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search across items and collections"
    >
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {data && data.items.length > 0 && (
          <CommandGroup heading="Items">
            {data.items.map((item) => {
              const Icon = ICON_MAP[item.typeIcon];
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.typeName}`}
                  onSelect={() => handleSelectItem(item)}
                >
                  {Icon && (
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: item.typeColor }}
                    />
                  )}
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.typeName}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {data && data.items.length > 0 && data.collections.length > 0 && (
          <CommandSeparator />
        )}

        {data && data.collections.length > 0 && (
          <CommandGroup heading="Collections">
            {data.collections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={collection.name}
                onSelect={() => handleSelectCollection(collection)}
              >
                <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{collection.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
