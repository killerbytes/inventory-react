import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { useProfit } from "@/features/inventory/hooks/useInventory";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatCurrency } from "@/utils/formatters";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { Profit } from "@/schemas/reports.schema";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { DateRange } from "react-day-picker";
import { filterProps } from "@/schemas";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

export default function ProfitPage() {
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "totalProfit",
  });

  const payload = {
    ...filter,
    ...(range?.from && range?.to && { startDate: range.from }),
    ...(range?.from && range?.to && { endDate: range.to }),
  };

  const { data = PAGINATION_RESPONSE, isLoading, error } = useProfit(payload);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    const { sort } = data;

    setFilter((prevState) => ({
      ...prevState,
      ...data,
      sort: last(sort?.split("_")),
    }));
  }, []);

  const columns = React.useMemo<ColumnDef<Profit>[]>(
    () => [
      {
        accessorKey: "nameSnapshot",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Name
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          const { combinations } = row.original;
          const name = combinations?.name || row.original.nameSnapshot;
          const unit = combinations?.unit || row.original.unit;

          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${combinations?.productId}`}
              className="flex gap-2 items-center"
            >
              <ColorBadge colorMap={UNIT_COLOR}>{String(unit)}</ColorBadge>
              {name}
            </Link>
          );
        },
      },
      {
        accessorKey: "totalQuantity",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Total Quantity
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          const { totalQuantity } = row.original;
          return Number(totalQuantity);
        },
      },
      {
        accessorKey: "totalProfit",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Total Profit
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          const { totalProfit } = row.original;
          return formatCurrency(totalProfit);
        },
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Profit Products
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DateRangePicker value={range} onChange={setRange} />

        <DataTable
          data={data.data || []}
          columns={columns}
          meta={{
            disabledRow: {
              combinations: false,
            },
          }}
        />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
