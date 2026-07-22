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

  return (
    <>
      {data?.summary && (
        <SummaryCard
          label="Today's Sale"
          value={
            <div>
              <div
                className={cx(
                  "text-lg font-semibold",
                  ((data.summary.totalAmount.value -
                    (previous?.summary?.totalAmount.value || 0)) /
                    (previous?.summary?.totalAmount.value || 0)) *
                    100 >
                    0
                    ? "text-green-500"
                    : "text-red-500",
                )}
              >
                {formatCurrency(data.summary.totalAmount.value)}
              </div>
              <div
                className={`text-xs ${
                  ((data.summary.totalAmount.value -
                    (previous?.summary?.totalAmount.value || 0)) /
                    (previous?.summary?.totalAmount.value || 0)) *
                    100 >
                  0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(
                  ((data.summary.totalAmount.value -
                    (previous?.summary?.totalAmount.value || 0)) /
                    (previous?.summary?.totalAmount.value || 0)) *
                    100,
                )}
                % vs Yesterday
              </div>
            </div>
          }
        />
      )}
    </>
  );
}
