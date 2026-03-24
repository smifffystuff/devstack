import { Badge } from "@/components/ui/badge";
import { Tag, FolderOpen, Calendar, Download, File } from "lucide-react";
import { fullDate } from "@/lib/utils";
import CodeEditor from "./CodeEditor";
import MarkdownEditor from "./MarkdownEditor";
import { MARKDOWN_TYPES, CODE_TYPES } from "@/lib/item-type-constants";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerContentProps {
  item: ItemDetail;
}

function ContentRenderer({ item }: { item: ItemDetail }) {
  const typeLower = item.typeName.toLowerCase();

  if (CODE_TYPES.includes(typeLower)) {
    return (
      <CodeEditor
        value={item.content!}
        language={item.language ?? undefined}
        readOnly
      />
    );
  }

  if (MARKDOWN_TYPES.includes(typeLower)) {
    return <MarkdownEditor value={item.content!} readOnly />;
  }

  return (
    <pre className="text-sm bg-accent rounded-lg p-4 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono">
      {item.content}
    </pre>
  );
}

function FileDisplay({ item }: { item: ItemDetail }) {
  const isImage = item.typeName.toLowerCase() === "image";

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2">
        {isImage ? "Image" : "File"}
      </h3>
      {isImage ? (
        <img
          src={item.fileUrl!}
          alt={item.fileName || item.title}
          className="max-w-full rounded-lg border border-border"
        />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
            <File className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">
              {item.fileName}
            </p>
            {item.fileSize && (
              <p className="text-xs text-muted-foreground">
                {item.fileSize < 1024
                  ? `${item.fileSize} B`
                  : item.fileSize < 1024 * 1024
                    ? `${(item.fileSize / 1024).toFixed(1)} KB`
                    : `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB`}
              </p>
            )}
          </div>
        </div>
      )}
      <a
        href={`/api/items/download/${item.id}`}
        className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-400 hover:underline"
      >
        <Download className="size-3.5" />
        Download
      </a>
    </div>
  );
}

export default function ItemDrawerContent({ item }: ItemDrawerContentProps) {
  return (
    <div className="px-4 space-y-5">
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}

      {item.content && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">
            Content
          </h3>
          <ContentRenderer item={item} />
        </div>
      )}

      {item.url && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">URL</h3>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline break-all"
          >
            {item.url}
          </a>
        </div>
      )}

      {item.fileUrl && <FileDisplay item={item} />}

      {item.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="size-3.5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {item.collections.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <FolderOpen className="size-3.5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">
              Collections
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((col) => (
              <Badge key={col.id} variant="outline">
                {col.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="size-3.5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Created</span>
          <span className="text-foreground text-right">
            {fullDate(item.createdAt)}
          </span>
          <span className="text-muted-foreground">Updated</span>
          <span className="text-foreground text-right">
            {fullDate(item.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
