'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ChevronDown, LogOut, Star } from 'lucide-react';
import { ICON_MAP } from '@/lib/item-type-icons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { capitalize } from '@/lib/utils';
import UserAvatar from '@/components/shared/UserAvatar';
import { useSidebar } from './SidebarProvider';

const TYPE_ORDER = ['snippet', 'prompt', 'command', 'note', 'file', 'image', 'link'];

function TypeIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = ICON_MAP[icon];
  if (!Icon) return null;
  return <Icon className="size-4" style={{ color }} />;
}

function SidebarContent() {
  const { data } = useSidebar();
  const { favoriteCollections, recentCollections } = data;
  const itemTypes = [...data.itemTypes].sort(
    (a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name),
  );

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
              {itemTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/dashboard/items/${type.name.toLowerCase()}`}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <TypeIcon icon={type.icon} color={type.color} />
                  <span className="flex-1 truncate">
                    {capitalize(type.name)}s
                    {(type.name === 'file' || type.name === 'image') && (
                      <Badge variant="outline" className="ml-1.5 h-4 px-1 text-[10px] font-semibold align-middle">
                        PRO
                      </Badge>
                    )}
                  </span>
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
            {favoriteCollections.length > 0 && (
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
                      <Star className="size-4 text-yellow-500 fill-yellow-500 shrink-0" />
                      <span className="flex-1 truncate">{col.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Recent Collections */}
            <div>
              <p className="px-2 pt-1 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Recent
              </p>
              <nav className="space-y-0.5">
                {recentCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: col.dominantColor || 'currentColor' }}
                    />
                    <span className="flex-1 truncate">{col.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                  </Link>
                ))}
              </nav>

              {/* View all collections */}
              <Link
                href="/collections"
                className="flex items-center gap-2.5 px-2 py-1.5 mt-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <span className="flex-1">View all collections</span>
              </Link>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* User Area */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 w-full rounded-md p-1 -m-1 hover:bg-accent transition-colors"
            aria-label="User menu"
          >
            <UserAvatar name={data.user.name} image={data.user.image} className="size-7" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">{data.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{data.user.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={() => window.location.href = '/dashboard/profile'}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/sign-in' })}>
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
