import {
  MODE_OF_PAYMENT_COLOR,
  ORDER_STATUS,
  PAGINATION,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { useSalesOrdersPaginated } from "@/features/sales-orders/hooks/useSalesOrders";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { filterProps, SalesOrder } from "@/schemas";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import ColorBadge from "@/components/ColorBadge";
import { useNavigate } from "react-router-dom";
import { cx } from "class-variance-authority";
import { DateRange } from "react-day-picker";
import Loader from "@/components/Loader";
import React from "react";

export default function RecentSalesOrders() {
  const navigate = useNavigate();
  const [range] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [filter] = React.useState<filterProps>({
    limit: 5,
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

  const { data, isLoading } = useSalesOrdersPaginated(payload);

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "salesOrderNumber",
      header: "Order #",
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => formatDateTime(row.getValue("orderDate")),
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <ColorBadge colorMap={STATUS_COLOR}>{String(status)}</ColorBadge>
        );
      },
    },

    {
      accessorKey: "modeOfPayment",
      header: "Payment Mode",
      meta: {
        headerClassName: "text-center",
        className: "text-center",
      },
      cell: ({ row }) => {
        return (
          <ColorBadge colorMap={MODE_OF_PAYMENT_COLOR}>
            {String(row.original.modeOfPayment)}
          </ColorBadge>
        );
      },
    },
    {
      accessorKey: "user.username",
      header: "User",
      cell: ({ row }) => {
        const statusHistoryMap = mappedStatusHistory(
          row.original.salesOrderStatusHistory ?? [],
        );
        return statusHistoryMap[row.original.status]?.user.username;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      meta: {
        headerClassName: "text-right",
        className: "text-right",
      },
      cell: ({ row }) => {
        const { totalAmount, totalReturnAmount, totalExchangeAmount } =
          row.original;

        return (
          <div
            className={cx({ "text-red-500": Number(totalReturnAmount) > 0 })}
          >
            {formatCurrency(
              Number(totalAmount) -
                Number(totalReturnAmount) +
                Number(totalExchangeAmount),
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">Recent Sales Orders</h1>
      <DataTable
        data={data?.data || []}
        columns={columns}
        meta={{
          disabledRow: {
            status: ORDER_STATUS.VOID,
          },
        }}
        onRowClick={(item: SalesOrder) => {
          if (item.status === ORDER_STATUS.DRAFT) {
          } else {
            navigate(`${ROUTES.SALES_ORDERS}/${item.id}`);
          }
        }}
      />
    </div>
  );
}
