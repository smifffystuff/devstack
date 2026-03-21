import { prisma } from "@/lib/prisma";

export interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
  isOAuth: boolean;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  totalTags: number;
  itemsByType: { name: string; icon: string; color: string; count: number }[];
}

export async function getProfileUser(userId: string): Promise<ProfileUser> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
      _count: { select: { accounts: true } },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
    isOAuth: user._count.accounts > 0,
  };
}

export async function getProfileStats(
  userId: string,
): Promise<ProfileStats> {
  const [totalItems, totalCollections, totalTags, typeResults] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.tag.count({ where: { userId } }),
      prisma.itemType.findMany({
        where: { isSystem: true },
        orderBy: { name: "asc" },
        select: {
          name: true,
          icon: true,
          color: true,
          _count: { select: { items: { where: { userId } } } },
        },
      }),
    ]);

  return {
    totalItems,
    totalCollections,
    totalTags,
    itemsByType: typeResults.map((t) => ({
      name: t.name,
      icon: t.icon ?? "",
      color: t.color ?? "",
      count: t._count.items,
    })),
  };
}
