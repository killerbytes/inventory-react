import { useSalesOrdersPaginated } from "@/features/sales-orders/hooks/useSalesOrders";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import SummaryCard from "@/components/SummaryCard";
import { filterProps } from "@/schemas";
import React from "react";

export default function LastMonthProfitCard() {
  const payload = React.useMemo<filterProps>(
    () => ({
      order: "DESC",
      sort: "orderDate",
      status: "ALL",
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    }),
    [],
  );

  const { data } = useSalesOrdersPaginated(payload);

  return (
    <>
      {data?.summary && (
        <SummaryCard
          label="Last Month's Profit"
          value={
            <span className="text-green-500">
              {formatCurrency(data.summary.totalProfitAmount.value)}
            </span>
          }
        />
      )}
    </>
  );
}
