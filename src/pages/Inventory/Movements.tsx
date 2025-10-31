import {
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
  INVENTORY_MOVEMENT_TYPE_COLOR,
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
  PAGINATION,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiErrorResponse,
  filterProps,
  InventoryMovement,
  PaginatedResponse,
} from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import Select from "@/components/Select";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function Movements() {
  const [range, setRange] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<PaginatedResponse<InventoryMovement>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
    q: "",
  });
  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        ...filter,
        ...(range?.from && range?.to && { startDate: range.from }),
        ...(range?.from && range?.to && { endDate: range.to }),
        q: filter.q === "" ? undefined : filter.q,
        type: filter.type === "ALL" ? undefined : filter.type,
      };

      const data = await inventoryServices.getMovements(payload);
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error("Error fetching data:", apiError.message);
    } finally {
      setLoading(false);
    }
  }, [filter, range.from, range.to]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const columns = React.useMemo<ColumnDef<InventoryMovement>[]>(
    () => [
      {
        header: "Product",
        accessorKey: "combination.product.name",
        cell: ({ row }) => {
          return (
            <Link
              className="flex gap-2 items-center"
              to={`${ROUTES.PRODUCTS}/${row.original.combination?.productId}`}
            >
              {row.original.combination?.name}
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(row.original.combination?.unit)}
              </ColorBadge>
            </Link>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        meta: {
          headerClassName: "text-center",
          className: "text-center",
        },
        cell: ({ row }) => {
          return (
            <Link to={`${ROUTES.GOOD_RECEIPT}/${row.original.reference}`}>
              <ColorBadge colorMap={INVENTORY_MOVEMENT_TYPE_COLOR}>
                {String(row.original.type)}
              </ColorBadge>
            </Link>
          );
        },
      },
      {
        accessorKey: "quantity",
        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        accessorKey: "costPerUnit",
        cell: ({ row }) => {
          return formatCurrency(row.original.costPerUnit);
        },
      },
      {
        accessorKey: "totalCost",
        cell: ({ row }) => {
          return formatCurrency(row.original.totalCost);
        },
      },
      {
        accessorKey: "referenceId",
        cell: ({ row }) => {
          let route;
          switch (row.original.referenceType) {
            case INVENTORY_MOVEMENT_REFERENCE_TYPE.GOOD_RECEIPT:
              route = ROUTES.GOOD_RECEIPT;
              break;
            case INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER:
              route = ROUTES.SALES_ORDERS;
              break;
            case INVENTORY_MOVEMENT_REFERENCE_TYPE.STOCK_ADJUSTMENT:
              route = ROUTES.GOOD_RECEIPT;
              break;
            default:
              route = ROUTES.GOOD_RECEIPT;
          }
          return (
            <Link to={`${route}/${row.original.referenceId}`}>
              {row.original.referenceType}:{row.original.referenceId}
            </Link>
          );
        },
      },

      {
        accessorKey: "updatedAt",
        header: "Updated At",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => {
          return formatDateTime(String(row.original.updatedAt));
        },
      },
      {
        header: "User",
        accessorKey: "user.username",
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Inventory Movements
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 justify-between">
          <Input
            placeholder="Search Product"
            className="w-full mb-4"
            value={filter.q}
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                q: e.target.value,
                page: 1,
              }));
            }}
          />
          <DateRangePicker
            className="mb-4"
            value={range}
            onChange={(e) => {
              console.log(e);
              setRange(e);
            }}
          />
          <Select
            options={INVENTORY_MOVEMENT_TYPE_OPTIONS}
            value={filter.type}
            onChange={(type) => {
              setFilter(({ ...prev }) => ({ ...prev, type }));
            }}
          />
        </div>
        <>
          <Loader isLoading={loading} />
          <DataTable data={data.data} columns={columns} showFooter={false} />
          {data.totalPages > 1 && (
            <Pager data={data} filter={filter} setFilter={setFilter} />
          )}
        </>
      </CardContent>
    </Card>
  );
}
