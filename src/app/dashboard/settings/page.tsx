import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProfileUser } from "@/lib/db/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChangePasswordButton from "@/components/profile/ChangePasswordButton";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import EditorPreferencesCard from "@/components/settings/EditorPreferencesCard";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await getProfileUser(session.user.id);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* Change Password */}
      {user.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update your password to keep your account secure.
            </p>
            <ChangePasswordButton />
          </CardContent>
        </Card>
      )}

      {/* Editor Preferences */}
      <EditorPreferencesCard />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all of your data. This action
            cannot be undone.
          </p>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
