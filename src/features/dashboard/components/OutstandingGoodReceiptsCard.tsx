import { useGoodReceiptsPaginated } from "@/features/good-receipts/hooks/useGoodReceipts";
import { MAX_START_DATE, PAGINATION } from "@/utils/definitions";
import { formatCurrency } from "@/utils/formatters";
import { endOfMonth, startOfMonth } from "date-fns";
import SummaryCard from "@/components/SummaryCard";
import { filterProps } from "@/schemas";
import React from "react";

export default function OutstandingGoodReceiptsCards() {
  const payload = React.useMemo<filterProps>(
    () => ({
      limit: 10,
      page: PAGINATION.PAGE,
      status: "RECEIVED",
      sort: "id",
      order: "DESC",
      q: "",
      startDate: startOfMonth(new Date(MAX_START_DATE)),
      endDate: endOfMonth(new Date()),
    }),
    [],
  );

  const { data } = useGoodReceiptsPaginated(payload);

  return (
    data &&
    data?.summary && (
      <SummaryCard
        label="Total Outstanding Good Receipts"
        value={
          <span className="text-yellow-500">
            {formatCurrency(data?.summary?.totalAmount.value)}
          </span>
        }
      />
    )
  );
}
