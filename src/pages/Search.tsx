import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useCategories } from "@/hooks/useCategories";
import { Link, useSearchParams } from "react-router";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { Spinner } from "@/components/ui/spinner";
import ColorBadge from "@/components/ColorBadge";
import { ProductCombination } from "@/schemas";
import { cx } from "class-variance-authority";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/Loader";
import { Search, X } from "lucide-react";
import React from "react";

export default function ProductSearch() {
  const [data, setData] = React.useState<ProductCombination[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = React.useState(initialSearch);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);

  const { data: category, isLoading } = useCategories();

  const mappedCategory = React.useMemo(
    () => new Map(isLoading ? [] : category?.map((item) => [item.id, item])),
    [category, isLoading],
  );

  const debouncedQuery = useDebounce(search, 300);

  const getData = React.useCallback(async () => {
    setLoading(true);
    const data = await getMappedSearchProductCombinations({
      search: debouncedQuery,
    });
    setData(data);
    setLoading(false);
  }, [debouncedQuery]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ search: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, setSearchParams]);

  const columns = React.useMemo<ColumnDef<ProductCombination>[]>(
    () => [
      {
        header: "Unit",
        accessorKey: "unit",
        meta: {
          headerClassName: "h-0",
          className: "w-20 text-xs",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          );
        },
      },
      {
        accessorKey: "Product",
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground">
                {mappedCategory.get(row.original.product.categoryId)?.name}
              </span>
              <Link
                className={GLOBAL_COLOR.PRODUCT}
                to={`${ROUTES.PRODUCTS}/${row.original.productId}`}
              >
                {row.original.name}
              </Link>
            </div>
          );
        },
      },

      {
        accessorKey: "price",
        header: "SRP",
        meta: {
          headerClassName: "h-0 text-right",
          className: "w-20 text-right font-bold",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          const price = row.original.price ?? 0;
          const avgPrice = Number(row.original.inventory?.averagePrice ?? 0);
          const error = price > 0 && avgPrice >= price;
          return (
            <span
              className={cx({
                "text-red-500 font-bold": error,
              })}
            >
              {formatCurrency(row.original.price || 0)}
            </span>
          );
        },
      },
      {
        accessorKey: "inventory.averagePrice",
        header: "Avg Price",
        meta: {
          headerClassName: "h-0 text-right",
          className: "w-20 text-right text-gray-500 text-xs",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return formatCurrency(Number(row.original.inventory?.averagePrice));
        },
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "h-0 text-right",
          className: "w-20 text-right",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return Number(row.original.inventory?.quantity);
        },
      },
    ],
    [mappedCategory],
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-2 p-2 md:gap-4 md:p-4">
      <InputGroup className="bg-background">
        <InputGroupInput
          ref={inputRef}
          placeholder="Search..."
          value={search}
          autoFocus
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        {search.length > 0 && (
          <>
            {loading ? (
              <InputGroupAddon align="inline-end">
                <Spinner />
              </InputGroupAddon>
            ) : (
              <>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setSearch("");
                      inputRef.current?.focus();
                    }}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>

                <InputGroupAddon align="inline-end">
                  {data.length} results
                </InputGroupAddon>
              </>
            )}
          </>
        )}
      </InputGroup>
      <div
        className={cx(
          "relative rounded overflow-hidden",
          loading && "min-h-[200px]",
        )}
      >
        <Loader isLoading={loading} />
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  );
}
