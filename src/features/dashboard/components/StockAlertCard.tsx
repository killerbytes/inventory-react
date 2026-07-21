import { useReorderLevels } from "@/features/inventory/hooks/useInventory";
import { PAGINATION, PAGINATION_RESPONSE } from "@/utils/definitions";
import SummaryCard from "@/components/SummaryCard";
import { filterProps } from "@/schemas";
import React from "react";

export default function StockAlertCard() {
  const [filter] = React.useState<filterProps>({
    limit: 10,
    page: PAGINATION.PAGE,
    sort: "lastSoldAt",
    order: "DESC",
    q: "",
  });

  const { data = PAGINATION_RESPONSE } = useReorderLevels(filter);

  return <SummaryCard label="Low Stock" value={data.meta.total} />;
}
