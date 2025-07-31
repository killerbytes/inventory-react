import {
  INVENTORY_TRANSACTION_TYPE,
  INVENTORY_TRANSACTION_TYPE_OPTIONS,
  PAGINATION,
  ROUTES,
} from "@/utils/definitions";
import TransactionTypeBadge from "@/components/TransactionTypeBadge";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { InventoryTransaction, PaginatedResponse } from "@/types";
import DateRangePicker from "@/components/DateRangePicker";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { inventoryServices } from "@/services";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/utils";
import Select from "@/components/Select";
import { MoveLeft } from "lucide-react";
import Pager from "@/components/Pager";
import React from "react";

export default function InventoryTransactions() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<
    PaginatedResponse<InventoryTransaction[]>
  >({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [range, setRange] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: 9999, //PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    // q: "",
    transactionType: INVENTORY_TRANSACTION_TYPE.ALL,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryServices.transactions({
        ...filter,
        transactionType:
          filter.transactionType === "ALL" ? undefined : filter.transactionType,
      });
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

  const columns: ColumnDef<InventoryTransaction>[] = [
    {
      accessorKey: "reference",
      header: "Order",
      meta: {
        className: "text-center font-medium",
      },
      cell: ({ row }) => {
        return (
          <Link
            to={`${row.original.orderType === "SALES" ? ROUTES.SALES_ORDERS : ROUTES.PURCHASE_ORDERS}/${row.getValue("reference")}`}
          >
            {row.getValue("reference")}
          </Link>
        );
      },
    },
    {
      accessorKey: "inventory.product.name",
      header: "Name",
    },
    {
      accessorKey: "previousValue",
      header: () => <div className="text-right">Previous Value</div>,
      meta: {
        className: "text-right",
      },
      cell: ({ row }) => {
        return (
          <div className="text-right">
            {row.original.transactionType ===
            INVENTORY_TRANSACTION_TYPE.PRICE_ADJUSTMENT
              ? formatCurrency(row.getValue("previousValue"))
              : parseInt(row.getValue("previousValue"))}
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Value</div>,
      meta: {
        className: "text-right",
      },
      cell: ({ row }) => {
        return (
          <div className="text-right">
            {row.original.transactionType ===
            INVENTORY_TRANSACTION_TYPE.PRICE_ADJUSTMENT
              ? formatCurrency(row.getValue("value"))
              : parseInt(row.getValue("value"))}
          </div>
        );
      },
    },
    {
      accessorKey: "newValue",
      header: () => <div className="text-right">New Value</div>,
      meta: {
        className: "text-right",
      },
      cell: ({ row }) => {
        return (
          <div className="text-right">
            {row.original.transactionType ===
            INVENTORY_TRANSACTION_TYPE.PRICE_ADJUSTMENT
              ? formatCurrency(row.getValue("newValue"))
              : parseInt(row.getValue("newValue"))}
          </div>
        );
      },
    },

    {
      accessorKey: "transactionType",
      header: () => <div className="text-center">Transaction Type</div>,
      meta: {
        className: "text-center",
      },
      cell: ({ row }) => {
        return <TransactionTypeBadge value={row.getValue("transactionType")} />;
      },
    },

    {
      accessorKey: "updatedAt",
      header: "Modified",
      cell: ({ row }) => formatDateTime(row.getValue("updatedAt")),
    },
  ];
  return (
    <div>
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(ROUTES.INVENTORY)}
          className="mb-4"
        >
          <MoveLeft /> Back
        </Button>
      </div>

      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Inventory History</h1>
        </div>
      </header>
      <div className="flex gap-2 justify-between">
        <Input
          placeholder="Search history"
          className="w-full mb-4"
          value={filter.q}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              q: e.target.value,
            }));
          }}
        />
        <Select
          className="mb-4"
          options={INVENTORY_TRANSACTION_TYPE_OPTIONS}
          value={filter.transactionType}
          onChange={(e) => {
            const { value } = e.target;
            setFilter((prev) => ({ ...prev, transactionType: value }));
          }}
        />
        <DateRangePicker className="mb-4" value={range} onChange={setRange} />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable data={data.data || []} columns={columns}></DataTable>

          <Pager data={data} page={page} setPage={setPage} />
        </>
      )}
    </div>
  );
}
