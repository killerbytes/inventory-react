import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { productCombinationServices } from "@/services";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Link, useSearchParams } from "react-router";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { Spinner } from "@/components/ui/spinner";
import ColorBadge from "@/components/ColorBadge";
import { cx } from "class-variance-authority";
import useDebounce from "@/hooks/useDebounce";
import { ProductCombinations } from "@/types";
import { Search, X } from "lucide-react";
import React from "react";

export default function ProductSearch() {
  const [data, setData] = React.useState<ProductCombinations[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = React.useState(initialSearch);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);

  const getData = React.useCallback(async (search: string) => {
    if (!search || search.length < 2) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      const res = await productCombinationServices.search({
        search,
        limit: 20,
      });

      const result = [];
      const words = search
        .toLowerCase()
        .split(" ")
        .filter((i) => i.length > 0);

      for (const item of res) {
        const productCombinations = item.combinations.filter(
          (i: ProductCombinations) => {
            const name = i.name.toLowerCase();
            return words.every((word) => name.includes(word.toLowerCase()));
          },
        );

        result.push(...productCombinations);
      }

      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedQuery = useDebounce(search, 300);

  React.useEffect(() => {
    getData(debouncedQuery);
  }, [debouncedQuery, getData]);

  React.useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ search: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, setSearchParams]);

  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        header: "Unit",
        accessorKey: "unit",
        meta: {
          headerClassName: "h-0",
          className: "w-20 text-xs",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          );
        },
      },
      {
        accessorKey: "Product",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return (
            <Link
              className={GLOBAL_COLOR.PRODUCT}
              to={`${ROUTES.PRODUCTS}/${row.original.productId}`}
            >
              {row.original.name}
            </Link>
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
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          const error =
            Number(row.original.inventory?.averagePrice) >= row.original.price;
          return (
            <span
              className={cx({
                "text-red-500 font-bold": error,
              })}
            >
              {formatCurrency(row.original.price)}
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
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
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
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return Number(row.original.inventory?.quantity);
        },
      },
    ],
    [],
  );

  return (
    <div className="ml-auto p-4 flex flex-col gap-4">
      <InputGroup>
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
      <DataTable data={data} columns={columns} />
    </div>
  );
}
