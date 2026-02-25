import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  UNIT_COLOR,
} from "@/utils/definitions";
import { filterProps, PaginatedResponse, PriceHistory } from "@/schemas";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { inventoryServices } from "@/services";
import { cx } from "class-variance-authority";
import { Link } from "react-router";
import React from "react";

interface filterPropTypes extends filterProps {
  productId: string;
}

export default function PriceHistoryTab({
  productId,
  selectedCombination,
  isBreakPackFilter,
}: {
  productId: string;
  selectedCombination: { id: number | string; name: string };
  isBreakPackFilter: boolean;
}) {
  const [data, setData] =
    React.useState<PaginatedResponse<PriceHistory>>(PAGINATION_RESPONSE);

  const [filter, setFilter] = React.useState<filterPropTypes>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "changedAt",
    order: "ASC",
    q: "",
    productId,
  });

  const getData = React.useCallback(async () => {
    const data = await inventoryServices.getPriceHistory(filter);

    setData(data);
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns = React.useMemo<ColumnDef<PriceHistory>[]>(
    () => [
      {
        accessorKey: "combinations.name",
        header: "Name",
        meta: {},
        cell: ({ row }) => {
          const { combinations } = row.original;

          return (
            <Link
              to={`${ROUTES.PRODUCTS}/${combinations?.productId}`}
              className="flex gap-2 items-center"
            >
              <ColorBadge colorMap={UNIT_COLOR}>
                {String(combinations?.unit)}
              </ColorBadge>
              {combinations?.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "fromPrice",
        header: "From",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { fromPrice } = row.original;
          return formatCurrency(fromPrice);
        },
      },
      {
        accessorKey: "toPrice",
        header: "To",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { fromPrice, toPrice } = row.original;
          const positive =
            parseFloat(String(fromPrice)) > parseFloat(String(toPrice));
          return (
            <div
              className={cx("flex items-center justify-end gap-1", {
                "text-red-500": positive,
                "text-green-500": !positive,
              })}
            >
              {formatCurrency(toPrice)}
            </div>
          );
        },
      },

      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Created
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          return formatDateTime(String(row.original.changedAt));
        },
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          return row.original.user?.username;
        },
      },
    ],
    [filter, handleFilterChange],
  );

  const filterData = React.useMemo(() => {
    if (selectedCombination.id === -1) {
      return data.data || [];
    }

    return isBreakPackFilter
      ? data.data?.filter((item) =>
          item.combinations.values.find(
            (item) => item.id === selectedCombination.id,
          ),
        )
      : data.data?.filter(
          (item) => item.combinations.name === selectedCombination.name,
        ) || [];
  }, [
    data,
    isBreakPackFilter,
    selectedCombination.id,
    selectedCombination.name,
  ]);

  return (
    <DataTable
      data={filterData}
      columns={columns}
      meta={{
        disabledRow: {
          "combinations.deletedAt": true,
        },
      }}
    />
  );
}
