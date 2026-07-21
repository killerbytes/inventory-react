import { useGoodReceiptsPaginated } from "@/features/good-receipts/hooks/useGoodReceipts";
import { MAX_START_DATE, PAGINATION, ROUTES } from "@/utils/definitions";
import { GoodReceipt, filterProps } from "@/schemas";
import { formatCurrency } from "@/utils/formatters";
import { endOfMonth, startOfMonth } from "date-fns";
import SummaryCard from "@/components/SummaryCard";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { cx } from "class-variance-authority";
import { DateRange } from "react-day-picker";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import React from "react";

export default function OutstandingGoodReceiptsCards() {
  const navigate = useNavigate();

  const [range] = React.useState<DateRange>({
    from: startOfMonth(new Date(MAX_START_DATE)),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: 10,
    page: PAGINATION.PAGE,
    status: "RECEIVED",
    sort: "id",
    order: "DESC",
    q: "",
  });

  const payload = {
    ...filter,
    ...(range?.from && range?.to && { startDate: range.from }),
    ...(range?.from && range?.to && { endDate: range.to }),
  };

  const { data, isLoading, isError, error } = useGoodReceiptsPaginated(payload);

  if (isError) {
    toast.error(error?.message);
  }

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "supplier.name",
        header: "Supplier",
        cell: ({ row }) => (
          <div className="truncate max-w-50">{row.original.supplier?.name}</div>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
        meta: {
          headerClassName: "justify-end",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { totalAmount, totalReturnAmount } = row.original;

          return (
            <div
              className={cx({ "text-red-500": Number(totalReturnAmount) > 0 })}
            >
              {formatCurrency(Number(totalAmount) - Number(totalReturnAmount))}
            </div>
          );
        },
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    data &&
    data?.summary && (
      <SummaryCard
        label="Total Outstanding Good Receipts"
        value={formatCurrency(data?.summary?.totalAmount.value)}
      />
    )
  );
}
