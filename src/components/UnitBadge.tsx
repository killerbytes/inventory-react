import { UNIT_COLOR } from "@/utils/definitions";
import { Badge } from "./ui/badge";

export default function UnitBadge({ unit }: { unit: string }) {
  return <Badge className={`text-white ${UNIT_COLOR[unit]}`}>{unit}</Badge>;
}
