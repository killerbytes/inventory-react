import { UNIT_COLOR } from "@/utils/definitions";
import { Badge } from "./ui/badge";

export default function UnitBadge({ unit }: { unit: keyof typeof UNIT_COLOR }) {
  return <Badge className={`text-accent ${UNIT_COLOR[unit]}`}>{unit}</Badge>;
}
