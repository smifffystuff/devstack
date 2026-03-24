import { Label } from "@/components/ui/label";
import { ICON_MAP } from "@/lib/item-type-icons";

export const ITEM_TYPES = [
  { name: "Snippet", icon: "Code", color: "#3b82f6" },
  { name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Command", icon: "Terminal", color: "#f97316" },
  { name: "Note", icon: "StickyNote", color: "#fde047" },
  { name: "Link", icon: "Link", color: "#10b981" },
  { name: "File", icon: "File", color: "#6b7280" },
  { name: "Image", icon: "Image", color: "#ec4899" },
] as const;

interface ItemTypeSelectorProps {
  value: string;
  onChange: (name: string) => void;
}

export default function ItemTypeSelector({ value, onChange }: ItemTypeSelectorProps) {
  return (
    <div className="space-y-1.5">
      <Label>Type</Label>
      <div className="flex flex-wrap gap-2">
        {ITEM_TYPES.map((type) => {
          const Icon = ICON_MAP[type.icon];
          const selected = value === type.name;
          return (
            <button
              key={type.name}
              type="button"
              onClick={() => onChange(type.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {Icon && (
                <Icon
                  className="size-3.5"
                  style={{ color: type.color }}
                />
              )}
              {type.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
