import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ICON_MAP } from "@/lib/item-type-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";
import type { SidebarItemType } from "@/lib/db/items";

const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

interface SidebarTypesListProps {
  itemTypes: SidebarItemType[];
}

export default function SidebarTypesList({ itemTypes }: SidebarTypesListProps) {
  const sorted = [...itemTypes].sort(
    (a, b) => TYPE_ORDER.indexOf(a.name) - TYPE_ORDER.indexOf(b.name),
  );

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
        <span>Types</span>
        <ChevronDown className="size-3.5 transition-transform [[data-state=closed]>&]:rotate-(-90)" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <nav className="space-y-0.5">
          {sorted.map((type) => {
            const Icon = ICON_MAP[type.icon];
            return (
              <Link
                key={type.id}
                href={`/dashboard/items/${type.name.toLowerCase()}`}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {Icon && <Icon className="size-4" style={{ color: type.color }} />}
                <span className="flex-1 truncate">
                  {capitalize(type.name)}s
                  {(type.name === "file" || type.name === "image") && (
                    <Badge variant="outline" className="ml-1.5 h-4 px-1 text-[10px] font-semibold align-middle">
                      PRO
                    </Badge>
                  )}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{type.count}</span>
              </Link>
            );
          })}
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}
