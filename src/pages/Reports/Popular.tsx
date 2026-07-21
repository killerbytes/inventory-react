import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { usePopularProducts } from "@/features/inventory/hooks/useInventory";
import DateRangePicker from "@/components/DateRangePicker";
import { endOfMonth, startOfMonth } from "date-fns";
import { Popular } from "@/schemas/reports.schema";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { DateRange } from "react-day-picker";
import Loader from "@/components/Loader";
import { filterProps } from "@/schemas";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import { last } from "lodash";
import React from "react";

export default function PopularPage() {
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "transactionCount",
  });
  const payload = {
    ...filter,
    ...(range?.from && range?.to && { startDate: range.from }),
    ...(range?.from && range?.to && { endDate: range.to }),
  };

  const { data = PAGINATION_RESPONSE, isLoading } = usePopularProducts(payload);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    const { sort } = data;

    setFilter((prevState) => ({
      ...prevState,
      ...data,
      sort: last(sort?.split("_")),
    }));
  }, []);

  const columns = React.useMemo<ColumnDef<Popular>[]>(
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
              className="flex gap-2 items-center text-primary"
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
    <>
      <PageHeader title="Popular Products" />
      <>
        <DateRangePicker value={range} onChange={setRange} />
        {isLoading ? (
          <Loader />
        ) : (
          <DataTable
            data={data.data || []}
            columns={columns}
            meta={{ disabledRow: { "combinations.isActive": false } }}
          />
        )}
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </>
    </>
  );
}
