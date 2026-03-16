import { Card, CardContent } from '@/components/ui/card';
import { Package, FolderOpen, Star, Heart } from 'lucide-react';
import { mockItems, mockCollections } from '@/lib/mock-data';

const stats = [
  {
    label: 'Total Items',
    value: mockItems.length,
    icon: Package,
    color: 'text-blue-500',
  },
  {
    label: 'Collections',
    value: mockCollections.length,
    icon: FolderOpen,
    color: 'text-emerald-500',
  },
  {
    label: 'Favorite Items',
    value: mockItems.filter((i) => i.isFavorite).length,
    icon: Star,
    color: 'text-yellow-500',
  },
  {
    label: 'Favorite Collections',
    value: mockCollections.filter((c) => c.isFavorite).length,
    icon: Heart,
    color: 'text-pink-500',
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div className={`${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
