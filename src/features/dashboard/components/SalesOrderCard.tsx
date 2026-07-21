import { useSalesOrdersPaginated } from "@/features/sales-orders/hooks/useSalesOrders";
import { formatCurrency } from "@/utils/formatters";
import SummaryCard from "@/components/SummaryCard";
import { PAGINATION } from "@/utils/definitions";
import { DateRange } from "react-day-picker";
import { filterProps } from "@/schemas";
import React from "react";

export default function SalesOrderCard() {
  const [range] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [filter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    order: "DESC",
    sort: "orderDate",
    status: "ALL",
  });
  const payload = {
    ...filter,
    ...(range?.from && range?.to && { startDate: range.from }),
    ...(range?.from && range?.to && { endDate: range.to }),

    status: filter.status === "ALL" ? undefined : filter.status,
  };

  const { data } = useSalesOrdersPaginated(payload);

  return (
    <>
      {data?.summary && (
        <SummaryCard
          label="Today's Sale"
          value={formatCurrency(data.summary.totalAmount.value)}
        />
      )}
    </>
  );
}
