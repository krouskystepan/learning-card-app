"use client";

import { cn } from "@/lib/utils";
import {
  SECTION_COLOR_IDS,
  SECTION_COLORS,
  SECTION_ICON_IDS,
  SECTION_ICONS,
  type SectionColorId,
  type SectionIconId,
} from "@/lib/section-style";
import { Label } from "@/components/ui/label";

type Props = {
  icon: SectionIconId;
  color: SectionColorId;
  onIconChange: (icon: SectionIconId) => void;
  onColorChange: (color: SectionColorId) => void;
};

export function SectionStylePicker({
  icon,
  color,
  onIconChange,
  onColorChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Ikona</Label>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {SECTION_ICON_IDS.map((id) => {
            const { Icon, label } = SECTION_ICONS[id];
            const selected = icon === id;
            return (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={selected}
                onClick={() => onIconChange(id)}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                  selected
                    ? "border-foreground/30 bg-muted text-foreground"
                    : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Barva</Label>
        <div className="flex flex-wrap gap-2">
          {SECTION_COLOR_IDS.map((id) => {
            const selected = color === id;
            const hue = SECTION_COLORS[id].hue;
            return (
              <button
                key={id}
                type="button"
                title={SECTION_COLORS[id].label}
                aria-label={SECTION_COLORS[id].label}
                aria-pressed={selected}
                onClick={() => onColorChange(id)}
                className={cn(
                  "size-8 cursor-pointer rounded-full border-2 transition-transform",
                  selected
                    ? "scale-110 border-foreground/40"
                    : "border-transparent hover:scale-105",
                )}
                style={{
                  background: `oklch(0.7 0.2 ${hue})`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
