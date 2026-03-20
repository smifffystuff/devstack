import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import TopBar from '@/components/dashboard/TopBar';
import Sidebar from '@/components/dashboard/Sidebar';
import SidebarProvider from '@/components/dashboard/SidebarProvider';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;

  const [itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getFavoriteCollections(userId),
    getRecentCollections(userId, 5),
  ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentCollections,
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
  };

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
