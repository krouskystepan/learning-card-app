import {
  normalizeSectionColor,
  normalizeSectionIcon,
  SECTION_ICONS,
  sectionColorVars,
  type SectionColorId,
  type SectionIconId,
} from "@/lib/section-style";
import { cn } from "@/lib/utils";

type Props = {
  icon?: string;
  color?: string;
  className?: string;
  iconClassName?: string;
};

export function SectionBadge({
  icon,
  color,
  className,
  iconClassName,
}: Props) {
  const iconId = normalizeSectionIcon(icon) as SectionIconId;
  const colorId = normalizeSectionColor(color) as SectionColorId;
  const { Icon } = SECTION_ICONS[iconId];

  return (
    <div
      className={cn(
        "section-badge flex size-9 shrink-0 items-center justify-center rounded-lg",
        className,
      )}
      style={sectionColorVars(colorId)}
    >
      <Icon className={cn("size-4", iconClassName)} />
    </div>
  );
}
