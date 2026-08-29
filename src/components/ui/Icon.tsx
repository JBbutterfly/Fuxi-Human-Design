import {
  ArrowLeft,
  Circle,
  CircleDot,
  Compass,
  Grid3x3,
  Layers,
  NotebookPen,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

// Lucide is the brand's icon set (a stated substitution — no icon assets were
// supplied with the brief). Only the vocabulary the design system actually
// uses is registered here; add to this map rather than importing ad hoc
// icons elsewhere, so stroke weight/size stay consistent across the product.
const REGISTRY: Record<string, LucideIcon> = {
  compass: Compass,
  "grid-3x3": Grid3x3,
  "circle-dot": CircleDot,
  users: Users,
  "notebook-pen": NotebookPen,
  settings: Settings,
  search: Search,
  "sliders-horizontal": SlidersHorizontal,
  layers: Layers,
  "share-2": Share2,
  "arrow-left": ArrowLeft,
};

export type IconName = keyof typeof REGISTRY;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, color = "currentColor" }: IconProps) {
  const Glyph = REGISTRY[name] ?? Circle;
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", width: size, height: size, color, flex: "0 0 auto" }}
    >
      <Glyph size={size} strokeWidth={strokeWidth} color={color} />
    </span>
  );
}
