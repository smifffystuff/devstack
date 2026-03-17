import StatsCards from "@/components/dashboard/StatsCards";
import RecentCollections from "@/components/dashboard/RecentCollections";
import PinnedItems from "@/components/dashboard/PinnedItems";
import RecentItems from "@/components/dashboard/RecentItems";
import { getRecentCollections } from "@/lib/db/collections";
import {
  getPinnedItems,
  getRecentItems,
  getDashboardStats,
} from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export default async function DashboardPage() {
  const userId = await getDemoUserId();

  const [collections, pinnedItems, recentItems, stats] = userId
    ? await Promise.all([
        getRecentCollections(userId),
        getPinnedItems(userId),
        getRecentItems(userId),
        getDashboardStats(userId),
      ])
    : [[], [], [], null];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your developer knowledge hub
        </p>
      </div>

      <StatsCards stats={stats} />
      <RecentCollections collections={collections} />
      <PinnedItems items={pinnedItems} />
      <RecentItems items={recentItems} />
    </div>
  );
}
