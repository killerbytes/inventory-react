import { cx } from "class-variance-authority";
import { Badge } from "./ui/badge";

export default function ColorBadge({
  className,
  children,
  colorMap = {},
  ...props
}: {
  className?: string;
  children: string;
  colorMap?: Record<string, string>;
}) {
  const unit = children.toUpperCase() as keyof typeof colorMap;
  return (
    <Badge className={cx("text-xs", className, colorMap[unit])} {...props}>
      {unit}
    </Badge>
  );
}
