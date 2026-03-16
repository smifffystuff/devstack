'use client';

import Link from 'next/link';
import {
  Code,
  Sparkles,
  Terminal,
  FileText,
  Paperclip,
  Image,
  Link as LinkIcon,
  ChevronDown,
  Star,
  Settings,
  FolderOpen,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { mockItemTypes, mockTypeCounts, mockCollections, mockUser } from '@/lib/mock-data';
import { useSidebar } from './SidebarProvider';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  type_snippet: Code,
  type_prompt: Sparkles,
  type_command: Terminal,
  type_note: FileText,
  type_file: Paperclip,
  type_image: Image,
  type_url: LinkIcon,
};

const TYPE_COLORS: Record<string, string> = Object.fromEntries(
  mockItemTypes.map((t) => [t.id, t.color])
);

function TypeIcon({ typeId }: { typeId: string }) {
  const Icon = TYPE_ICONS[typeId];
  if (!Icon) return null;
  return <Icon className="size-4" style={{ color: TYPE_COLORS[typeId] }} />;
}

function SidebarContent() {
  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const recentCollections = [...mockCollections]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {/* Types Section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            <span>Types</span>
            <ChevronDown className="size-3.5 transition-transform [[data-state=closed]>&]:rotate-(-90)" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <nav className="space-y-0.5">
              {mockTypeCounts.map((type) => (
                <Link
                  key={type.typeId}
                  href={`/items/${type.name.toLowerCase()}`}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <TypeIcon typeId={type.typeId} />
                  <span className="flex-1 truncate">{type.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{type.count}</span>
                </Link>
              ))}
            </nav>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-2" />

        {/* Collections Section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            <span>Collections</span>
            <ChevronDown className="size-3.5 transition-transform [[data-state=closed]>&]:rotate-(-90)" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {/* Favorites */}
            <div>
              <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Favorites
              </p>
              <nav className="space-y-0.5">
                {favoriteCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <FolderOpen className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{col.name}</span>
                    <Star className="size-3 text-yellow-500 fill-yellow-500 shrink-0" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* All Collections (most recent) */}
            <div>
              <p className="px-2 pt-1 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                All Collections
              </p>
              <nav className="space-y-0.5">
                {recentCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <FolderOpen className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{col.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* User Area */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-muted text-xs font-medium">
              {mockUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{mockUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-border bg-background overflow-hidden transition-[width] duration-200 ${
        collapsed ? 'w-0 border-r-0' : 'w-60'
      }`}
    >
      <SidebarContent />
    </aside>
  );
}

export { SidebarContent };
