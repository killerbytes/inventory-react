import {
  MODE_OF_PAYMENT_COLOR,
  ORDER_STATUS_OPTIONS,
  PAGINATION,
  STATUS_COLOR,
} from "@/utils/definitions";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import DateRangePicker from "@/components/DateRangePicker";
import { PaginatedResponse, PurchaseOrder } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { purchaseOrderServices } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";
import React from "react";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedResponse<PurchaseOrder[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    ...(range?.from && range?.to && { startDate: range.from.toISOString() }),
    ...(range?.from && range?.to && { endDate: range.to.toISOString() }),
  });

  React.useEffect(() => {
    const { from, to } = range || {};
    if (from && to) {
      setFilter((prev) => ({
        ...prev,
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    }
  }, [range]);

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse<PurchaseOrder[]> =
        await purchaseOrderServices.getAll(filter);
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [filter, getData]);

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: "purchaseOrderNumber",
      header: "PO #",
    },
    {
      accessorKey: "supplier.name",
      header: "Supplier",
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
      accessorKey: "statusHistory",
      header: "Date",
      cell: ({ row }) => {
        const statusHistoryMap = mappedStatusHistory(
          row.original.orderStatusHistory ?? [],
        );
        return formatDate(statusHistoryMap[row.original.status]?.changedAt);
      },
    },
    {
      accessorKey: "orderDate",
      header: "User",
      cell: ({ row }) => {
        const statusHistoryMap = mappedStatusHistory(
          row.original.orderStatusHistory ?? [],
        );
        return statusHistoryMap[row.original.status]?.user.username;
      },
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => formatDate(row.getValue("deliveryDate")),
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
      accessorKey: "totalAmount",
      header: () => "Total Amount",
      meta: {
        headerClassName: "text-right",
        className: "text-right",
      },
      cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Purchase Orders
          </CardTitle>
          <CardAction>
            <Link to="/purchases/new">
              <Button className="shadow-md">
                <Plus /> Create Order
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-between">
            <div>
              <DateRangePicker
                className="mb-4"
                value={range}
                onChange={setRange}
              />
            </div>
            <div className="w-1/4">
              <Select
                options={ORDER_STATUS_OPTIONS}
                value={ORDER_STATUS_OPTIONS[0].value}
                onChange={(selected) => {
                  if (selected === "ALL") {
                    setFilter(({ ...prev }) => ({ ...prev, status: "" }));
                  } else {
                    setFilter((prev) => ({ ...prev, status: selected }));
                  }
                }}
              />
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DataTable
                data={data.data || []}
                columns={columns}
                onRowClick={(item: PurchaseOrder) =>
                  navigate(`/purchases/${item.id}`)
                }
                renderFooter={(data: PurchaseOrder[]) => {
                  return (
                    <TableRow>
                      <TableCell colSpan={7}>Total Amount</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          data.reduce(
                            (acc: number, item: PurchaseOrder) =>
                              acc + parseFloat(item.totalAmount ?? "0"),
                            0,
                          ),
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
              {data.totalPages > 1 && (
                <Pager data={data} page={page} setPage={setPage} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
