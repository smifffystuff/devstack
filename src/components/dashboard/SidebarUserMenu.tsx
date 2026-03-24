"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/shared/UserAvatar";

interface SidebarUserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  return (
    <div className="border-t border-border p-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2.5 w-full rounded-md p-1 -m-1 hover:bg-accent transition-colors"
          aria-label="User menu"
        >
          <UserAvatar name={user.name} image={user.image} className="size-7" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem>
            <Link href="/dashboard/profile" className="w-full">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/sign-in" })}>
            <LogOut className="size-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
