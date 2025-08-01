import { TableCell, TableRow } from "@/components/ui/table";
import React from "react";

import {
  SalesOrderItem,
  salesOrderServices,
  type APIResponse,
  type SalesOrder,
} from "@/services";
import { ROUTES, ORDER_STATUS_OPTIONS, PAGINATION } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import DateRangePicker from "@/components/DateRangePicker";
import { Link, useNavigate } from "react-router-dom";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";

export default function SalesOrders() {
  const navigate = useNavigate();
  const [range, setRange] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [data, setData] = React.useState<APIResponse<SalesOrder[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    status: "ALL",
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
      const data = await salesOrderServices.getAll(filter);
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

  // const totalCompletedAmount = React.useMemo(() => {
  //   return data.data?.reduce((acc, item) => {
  //     return item.status === ORDER_STATUS.COMPLETED
  //       ? acc + (parseFloat(item.totalAmount.toString()) || 0)
  //       : acc;
  //   }, 0);
  // }, [data]);

  const columns: ColumnDef<SalesOrderItem>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "receivedByUser.name",
      header: "Received By",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge
            className={cx(
              `capitalize status-${row.getValue("status").toLowerCase()}`,
            )}
          >
            {row.getValue("status").toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.getValue("orderDate")),
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Total Amount</div>,
      meta: {
        className: "text-right",
      },
      cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
    },
  ];

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center ">
          <h1 className="font-medium">Sales Orders</h1>

          <div className="ml-auto">
            <Link to={ROUTES.SALES_ORDERS_CREATE}>
              <Button>
                <Plus /> Create Order
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex gap-2 justify-between mb-4">
        <DateRangePicker className="mb-4" value={range} onChange={setRange} />

        <div className="w-1/4">
          <Select
            options={ORDER_STATUS_OPTIONS}
            value={filter.status}
            onChange={(selected) => {
              if (selected === "ALL") {
                setFilter(({ status, ...prev }) => ({ ...prev }));
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
            onRowClick={(item) => navigate(`${ROUTES.SALES_ORDERS}/${item.id}`)}
            footer={
              <TableRow>
                <TableCell colSpan={4}>Total Amount</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    data.data.reduce(
                      (acc, item) => acc + parseFloat(item.totalAmount),
                      0,
                    ),
                  )}
                </TableCell>
              </TableRow>
            }
          />
          {data.totalPages > 1 && (
            <Pager data={data} page={page} setPage={setPage} />
          )}

          {/* <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data?.map((item) => (
                <TableRow
                  className="cursor-pointer"
                  key={item.id}
                  onClick={() => {
                    navigate(`/sales/${item.id}`);
                  }}
                >
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.receivedByUser.name}</TableCell>
                  <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                  <TableCell>
                    {item.status && (
                      <Badge
                        className={cx(
                          `capitalize status-${item.status.toLowerCase()}`,
                        )}
                      >
                        {item.status.toLowerCase()}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(item.orderDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager
            data={data}
            page={filter.page}
            setPage={(page) => {
              setFilter((prev) => ({
                ...prev,
                page,
              }));
            }}
          /> */}
        </>
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
