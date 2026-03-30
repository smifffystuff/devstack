import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import TopBar from '@/components/dashboard/TopBar';
import Sidebar from '@/components/dashboard/Sidebar';
import SidebarProvider from '@/components/dashboard/SidebarProvider';
import ItemDrawerProvider from '@/components/items/ItemDrawerProvider';
import CommandPaletteProvider from '@/components/search/CommandPaletteProvider';
import EditorPreferencesProvider from '@/components/editor/EditorPreferencesProvider';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getEditorPreferences } from '@/lib/db/profile';

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

  const [itemTypes, favoriteCollections, recentCollections, editorPreferences] = await Promise.all([
    getItemTypesWithCounts(userId),
    getFavoriteCollections(userId),
    getRecentCollections(userId, 5),
    getEditorPreferences(userId),
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
      <EditorPreferencesProvider initialPreferences={editorPreferences}>
        <ItemDrawerProvider>
          <CommandPaletteProvider>
            <div className="flex flex-col h-screen bg-background">
              <TopBar isPro={session.user.isPro ?? false} />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          </CommandPaletteProvider>
        </ItemDrawerProvider>
      </EditorPreferencesProvider>
    </SidebarProvider>
  );
}
