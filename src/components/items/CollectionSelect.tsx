"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { getCollections } from "@/actions/collections";

interface CollectionOption {
  id: string;
  name: string;
}

interface CollectionSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
}

export default function CollectionSelect({
  value,
  onChange,
  id = "collection",
}: CollectionSelectProps) {
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollections()
      .then(setCollections)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-1.5">
        <Label>Collections</Label>
        <div className="h-9 rounded-md border border-input bg-muted animate-pulse" />
      </div>
    );
  }

  if (collections.length === 0) return null;

  const available = collections.filter((c) => !value.includes(c.id));

  function handleAdd(name: string) {
    const match = collections.find((c) => c.name === name);
    if (match && !value.includes(match.id)) {
      onChange([...value, match.id]);
    }
  }

  function handleRemove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Collections</Label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((colId) => {
            const col = collections.find((c) => c.id === colId);
            if (!col) return null;
            return (
              <Badge key={colId} variant="secondary" className="gap-1 pr-1">
                {col.name}
                <button
                  type="button"
                  onClick={() => handleRemove(colId)}
                  className="rounded-sm hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${col.name}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      {available.length > 0 && (
        <select
          id={id}
          value=""
          onChange={(e) => handleAdd(e.target.value)}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground dark:bg-input/30 dark:hover:bg-input/50 [&>option]:bg-popover [&>option]:text-popover-foreground"
        >
          <option value="" disabled>
            Add to collection…
          </option>
          {available.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
