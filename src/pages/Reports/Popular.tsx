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
import { filterProps, PaginatedResponse, ProductCombination } from "@/schemas";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { DateRange } from "react-day-picker";
import { reportServices } from "@/services";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

type Props = {
  name: string;
  combinations: ProductCombination;
  lastSoldAt: string;
  quantity: number;
};

export default function Popular() {
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [data, setData] =
    React.useState<PaginatedResponse<Props>>(PAGINATION_RESPONSE);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "transactionCount",
  });

  const getData = React.useCallback(async () => {
    const payload = {
      ...filter,
      ...(range?.from && range?.to && { startDate: range.from }),
      ...(range?.from && range?.to && { endDate: range.to }),
    };
    const data = await reportServices.popular(payload);
    setData(data);
  }, [filter, range]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    const { sort } = data;

    setFilter((prevState) => ({
      ...prevState,
      ...data,
      sort: last(sort?.split("_")),
    }));
  }, []);

  const columns = React.useMemo<ColumnDef<Props>[]>(
    () => [
      {
        accessorKey: "combinations.name",
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
          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${combinations.productId}`}
              className="flex gap-2 items-center"
            >
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(combinations.unit)}
              </ColorBadge>
              {combinations.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "transactionCount",
        meta: {
          className: "text-right",
        },
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              align="right"
            >
              Transaction Count
            </ColumnSort>
          );
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
          Popular Products
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DateRangePicker value={range} onChange={setRange} />

        <DataTable
          data={data.data || []}
          columns={columns}
          meta={{ disabledRow: { "combinations.isActive": false } }}
        />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
