import { UNIT_COLOR } from "@/utils/definitions";
import { cx } from "class-variance-authority";
import { Badge } from "./ui/badge";

export default function UnitBadge({ unit }: { unit: string }) {
  return (
    <Badge className={cx("text-white text-xs", UNIT_COLOR[unit])}>{unit}</Badge>
  );
}
