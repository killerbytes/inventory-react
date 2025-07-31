import { TRANSACTION_TYPE_COLOR } from "@/utils/definitions";
import { formatLabel } from "@/lib/utils";
import { Badge } from "./ui/badge";

export default function TransactionTypeBadge({ value }: { value: string }) {
  return (
    <Badge className={`text-white ${TRANSACTION_TYPE_COLOR[value]}`}>
      {formatLabel(value)}
    </Badge>
  );
}
