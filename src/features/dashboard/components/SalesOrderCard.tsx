import { useSalesOrdersPaginated } from "@/features/sales-orders/hooks/useSalesOrders";
import { formatCurrency } from "@/utils/formatters";
import SummaryCard from "@/components/SummaryCard";
import { PAGINATION } from "@/utils/definitions";
import { cx } from "class-variance-authority";
import { DateRange } from "react-day-picker";
import { filterProps } from "@/schemas";
import { sub } from "date-fns";
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
  const payload = React.useMemo(
    () => ({
      ...filter,
      ...(range?.from && range?.to && { startDate: range.from }),
      ...(range?.from && range?.to && { endDate: range.to }),
      status: filter.status === "ALL" ? undefined : filter.status,
    }),
    [filter, range],
  );

  const previousPayload = React.useMemo(() => {
    const yesterday = sub(new Date(), { days: 1 });
    return {
      ...payload,
      startDate: yesterday,
      endDate: yesterday,
    };
  }, [payload]);

  const { data } = useSalesOrdersPaginated(payload);
  const { data: previous } = useSalesOrdersPaginated(previousPayload);

  const currentTotal = data?.summary?.totalAmount?.value ?? 0;
  const previousTotal = previous?.summary?.totalAmount?.value ?? 0;

  const percentageChange = React.useMemo(() => {
    if (!previousTotal || previousTotal === 0) {
      return currentTotal > 0 ? 100 : 0;
    }
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }, [currentTotal, previousTotal]);

  return (
    <>
      {data?.summary && previous?.summary && (
        <SummaryCard
          label="Today's Sale"
          value={
            <div>
              <div
                className={cx(
                  "text-lg font-semibold",
                  percentageChange > 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {formatCurrency(currentTotal)}
              </div>
              <div
                className={cx(
                  "text-xs",
                  percentageChange > 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {percentageChange.toFixed(1)}% vs Yesterday
              </div>
            </div>
          }
        />
      )}
    </>
  );
}
