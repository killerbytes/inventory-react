import {
  purchaseOrderServices,
  type APIResponse,
  type PurchaseOrder,
} from "@/services";
import {
  MODE_OF_PAYMENT,
  ORDER_STATUS_OPTIONS,
  PAGINATION,
} from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import DateRangePicker from "@/components/DateRangePicker";
import { endOfMonth, set, startOfMonth } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import Badge from "@/components/Badge";
import { Plus } from "lucide-react";
import React from "react";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<APIResponse<PurchaseOrder[]>>({
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
      const data: APIResponse<PurchaseOrder[]> =
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
      accessorKey: "orderByUser.name",
      header: "Order By",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase();
        return <Badge type={status} />;
      },
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.getValue("orderDate")),
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => formatDate(row.getValue("deliveryDate")),
    },
    {
      accessorKey: "modeOfPayment",
      header: "Payment Mode",
      cell: ({ row }) => {
        return <Badge type={row.original.modeOfPayment} />;
      },
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
        <div className="flex w-full items-center">
          <h1 className="font-medium">Purchase Orders</h1>

          <div className="ml-auto">
            <Link to="/purchases/new">
              <Button>
                <Plus /> Create Order
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex gap-2 justify-between">
        <div>
          <DateRangePicker className="mb-4" value={range} onChange={setRange} />
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
            footer={
              <TableRow>
                <TableCell colSpan={7}>Total Amount</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    data.data.reduce(
                      (acc, item) => acc + parseFloat(item.totalAmount ?? "0"),
                      0,
                    ),
                  )}
                </TableCell>
              </TableRow>
            }
          ></DataTable>
          {data.totalPages > 1 && (
            <Pager data={data} page={page} setPage={setPage} />
          )}
        </>
      )}
    </div>
  );
}
