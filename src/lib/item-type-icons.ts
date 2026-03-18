import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from "lucide-react";

export type IconComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
}>;

export const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};
