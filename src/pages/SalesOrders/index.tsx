import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ORDER_STATUS_OPTIONS, PAGINATION, ROUTES } from "@/utils/definitions";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { PaginatedResponse, SalesOrder, StatusHistory } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import DateRangePicker from "@/components/DateRangePicker";
import { Link, useNavigate } from "react-router-dom";
import { endOfMonth, startOfMonth } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { salesOrderServices } from "@/services";
import { Badge } from "@/components/ui/badge";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";
import React from "react";

export default function SalesOrders() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedResponse<SalesOrder[]>>({
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
      const data: PaginatedResponse<SalesOrder[]> =
        await salesOrderServices.getAll(filter);
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

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "salesOrderNumber",
      header: "PO #",
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
        return <StatusBadge>{String(status)}</StatusBadge>;
      },
    },
    {
      accessorKey: "statusHistory",
      header: "Date",
      cell: ({ row }) => {
        const statusHistoryMap = mappedStatusHistory(
          row.original.salesOrderStatusHistory ?? [],
        );
        return formatDate(statusHistoryMap[row.original.status]?.changedAt);
      },
    },
    {
      accessorKey: "orderDate",
      header: "User",
      cell: ({ row }) => {
        const statusHistoryMap = mappedStatusHistory(
          row.original.salesOrderStatusHistory ?? [],
        );
        return statusHistoryMap[row.original.status]?.user.name;
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
        return <StatusBadge>{String(row.original.modeOfPayment)}</StatusBadge>;
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
          <CardTitle>Sales Orders</CardTitle>
          <CardAction>
            <Link to={`${ROUTES.SALES_ORDERS}/new`}>
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
                onRowClick={(item: SalesOrder) =>
                  navigate(`${ROUTES.SALES_ORDERS}/${item.id}`)
                }
                renderFooter={(data: SalesOrder[]) => {
                  return (
                    <TableRow>
                      <TableCell colSpan={7}>Total Amount</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          data.reduce(
                            (acc: number, item: SalesOrder) =>
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
