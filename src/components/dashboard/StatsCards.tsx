import { Card, CardContent } from "@/components/ui/card";
import { Package, FolderOpen, Star, Heart } from "lucide-react";
import type { DashboardStats } from "@/lib/db/items";

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Items",
      value: stats?.totalItems ?? 0,
      icon: Package,
      color: "text-blue-500",
    },
    {
      label: "Collections",
      value: stats?.totalCollections ?? 0,
      icon: FolderOpen,
      color: "text-emerald-500",
    },
    {
      label: "Favorite Items",
      value: stats?.favoriteItems ?? 0,
      icon: Star,
      color: "text-yellow-500",
    },
    {
      label: "Favorite Collections",
      value: stats?.favoriteCollections ?? 0,
      icon: Heart,
      color: "text-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
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
