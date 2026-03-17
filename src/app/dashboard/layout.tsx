import TopBar from '@/components/dashboard/TopBar';
import Sidebar from '@/components/dashboard/Sidebar';
import SidebarProvider from '@/components/dashboard/SidebarProvider';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { prisma } from '@/lib/prisma';

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getDemoUserId();

  const [itemTypes, favoriteCollections, recentCollections] = userId
    ? await Promise.all([
        getItemTypesWithCounts(userId),
        getFavoriteCollections(userId),
        getRecentCollections(userId, 5),
      ])
    : [[], [], []];

  const sidebarData = { itemTypes, favoriteCollections, recentCollections };

  return (
    <SidebarProvider data={sidebarData}>
      <div className="flex flex-col h-screen bg-background">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
