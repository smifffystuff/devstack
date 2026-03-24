"use client";

import {
  FileText,
  FileJson,
  FileCode,
  FileSpreadsheet,
  File,
  Download,
  Star,
  Pin,
} from "lucide-react";
import { useItemDrawer } from "./ItemDrawerProvider";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";

const FILE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ".pdf": FileText,
  ".txt": FileText,
  ".md": FileCode,
  ".json": FileJson,
  ".yaml": FileCode,
  ".yml": FileCode,
  ".xml": FileCode,
  ".csv": FileSpreadsheet,
  ".toml": FileCode,
  ".ini": FileCode,
};

function getFileIcon(fileName: string | null) {
  if (!fileName) return File;
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return FILE_ICON_MAP[ext] ?? File;
}

interface FileRowProps {
  item: DashboardItem;
}

export default function FileRow({ item }: FileRowProps) {
  const { openItem } = useItemDrawer();
  const Icon = getFileIcon(item.fileName);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openItem(item.id);
        }
      }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors group"
    >
      <Icon className="size-5 text-muted-foreground shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {item.title}
          </span>
          {item.isFavorite && (
            <Star className="size-3 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
          {item.isPinned && (
            <Pin className="size-3 text-muted-foreground shrink-0" />
          )}
        </div>
        {item.fileName && (
          <span className="text-xs text-muted-foreground truncate block">
            {item.fileName}
          </span>
        )}
      </div>

      <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
        {formatFileSize(item.fileSize)}
      </span>

      <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
        {formatDate(item.createdAt)}
      </span>

      <a
        href={`/api/items/download/${item.id}`}
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        aria-label={`Download ${item.title}`}
      >
        <Download className="size-4" />
      </a>
    </div>
  );
}
