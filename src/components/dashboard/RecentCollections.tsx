import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Star, MoreHorizontal, Code, Sparkles, Terminal, FileText, Paperclip, Image, Link as LinkIcon } from 'lucide-react';
import { mockCollections, mockItems, mockItemTypes } from '@/lib/mock-data';

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

function getCollectionTypeIds(collectionId: string): string[] {
  const typeIds = new Set<string>();
  for (const item of mockItems) {
    if (item.collectionId === collectionId) {
      typeIds.add(item.typeId);
    }
  }
  return Array.from(typeIds);
}

const recentCollections = [...mockCollections]
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 6);

export default function RecentCollections() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Collections</h2>
        <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentCollections.map((col) => {
          const typeIds = getCollectionTypeIds(col.id);
          return (
            <Card key={col.id} size="sm" className="hover:ring-foreground/20 transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="truncate">{col.name}</CardTitle>
                  {col.isFavorite && (
                    <Star className="size-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                </div>
                <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="size-4" />
                </button>
                <CardDescription>{col.itemCount} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-1">{col.description}</p>
                <div className="flex items-center gap-1.5">
                  {typeIds.map((typeId) => {
                    const Icon = TYPE_ICONS[typeId];
                    if (!Icon) return null;
                    return (
                      <Icon
                        key={typeId}
                        className="size-3.5"
                        style={{ color: TYPE_COLORS[typeId] }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
