import { BADGE_COLOR } from "@/utils/definitions";
import { cx } from "class-variance-authority";
import { Badge } from "./ui/badge";

export default function StatusBadge({
  className,
  children,
  ...props
}: {
  className?: string;
  children: string;
}) {
  const status = children.toUpperCase() as keyof typeof BADGE_COLOR;
  return (
    <Badge
      variant="outline"
      className={cx("text-xs", className, BADGE_COLOR[status])}
      {...props}
    >
      {status}
    </Badge>
  );
}
