'use client';

import { Separator } from '@/components/ui/separator';
import { useSidebar } from './SidebarProvider';
import SidebarTypesList from './SidebarTypesList';
import SidebarCollectionsList from './SidebarCollectionsList';
import SidebarUserMenu from './SidebarUserMenu';

function SidebarContent() {
  const { data } = useSidebar();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        <SidebarTypesList itemTypes={data.itemTypes} />
        <Separator className="my-2" />
        <SidebarCollectionsList
          favoriteCollections={data.favoriteCollections}
          recentCollections={data.recentCollections}
        />
      </div>
      <SidebarUserMenu user={data.user} />
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
