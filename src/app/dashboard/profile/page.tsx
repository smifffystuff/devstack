import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileUser, getProfileStats } from "@/lib/db/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICON_MAP } from "@/lib/item-type-icons";
import { capitalize, formatDate } from "@/lib/utils";
import UserAvatar from "@/components/shared/UserAvatar";
import ChangePasswordButton from "@/components/profile/ChangePasswordButton";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const [user, stats] = await Promise.all([
    getProfileUser(userId),
    getProfileStats(userId),
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-6">
          <UserAvatar
            name={user.name}
            image={user.image}
            className="size-16 text-lg"
          />
          <div className="space-y-1">
            {user.name && (
              <p className="text-lg font-semibold text-foreground">
                {user.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Joined {formatDate(user.createdAt)}
            </p>
            {user.isOAuth && (
              <p className="text-xs text-muted-foreground">
                Signed in with GitHub
              </p>
            )}
          </div>
        </CardContent>
        <CardContent className="flex items-center gap-3 border-t border-border pt-4">
          {user.hasPassword && <ChangePasswordButton />}
          <DeleteAccountButton />
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalItems}
              </p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalCollections}
              </p>
              <p className="text-xs text-muted-foreground">Collections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTags}
              </p>
              <p className="text-xs text-muted-foreground">Tags</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">
              Items by type
            </p>
            <div className="space-y-2">
              {stats.itemsByType.map((type) => {
                const Icon = ICON_MAP[type.icon];
                return (
                  <div
                    key={type.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon
                          className="size-4"
                          style={{ color: type.color }}
                        />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {capitalize(type.name)}s
                      </span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {type.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
