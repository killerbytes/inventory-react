import { UNIT_COLOR } from "@/utils/definitions";
import { cx } from "class-variance-authority";
import { Badge } from "./ui/badge";

export default function UnitBadge({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  const unit = children.toUpperCase() as keyof typeof UNIT_COLOR;
  return (
    <Badge className={cx("text-xs", className, UNIT_COLOR[unit])}>{unit}</Badge>
  );
}
