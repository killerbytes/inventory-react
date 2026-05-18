import { INVENTORY_MOVEMENT_MAP } from "@/utils/definitions";
import { cx } from "class-variance-authority";
import { Badge } from "./ui/badge";

export default function ColorBadge({
  className,
  children,
  colorMap = {},
  ...props
}: {
  className?: string;
  children: string | undefined;
  colorMap?: Record<string, string>;
}) {
  const unit = children?.toUpperCase() as keyof typeof colorMap;
  const value = (INVENTORY_MOVEMENT_MAP as Record<string, string>)[unit];
  return (
    <Badge
      className={cx(
        "text-[9px]",
        className,
        colorMap[unit] || "bg-white text-black",
      )}
      {...props}
    >
      {value || unit}
    </Badge>
  );
}
