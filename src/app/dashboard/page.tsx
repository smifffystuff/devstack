import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
import {
  DASHBOARD_COLLECTIONS_LIMIT,
  DASHBOARD_RECENT_ITEMS_LIMIT,
} from "@/lib/constants";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const [collections, pinnedItems, recentItems, stats] = await Promise.all([
    getRecentCollections(userId, DASHBOARD_COLLECTIONS_LIMIT),
    getPinnedItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT),
    getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT),
    getDashboardStats(userId),
  ]);

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
