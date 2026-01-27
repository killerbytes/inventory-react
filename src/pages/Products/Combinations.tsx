import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";
import BreakPackModal from "@/components/modals/BreakPackModal";
import { ProductCombinations, VariantTypes } from "@/types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { PackageOpen, Pencil } from "lucide-react";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import Tooltip from "@/components/Tooltip";
import useToggle from "@/hooks/useToggle";
import { useStore } from "@/stores";
import React from "react";

export default function Combinations({
  combinations: _combinations,
  variants,
  getData,
  selectedCombination,
  isBreakPackFilter,
}: {
  combinations: ProductCombinations[];
  variants: VariantTypes[];
  getData: () => void;
  selectedCombination: { id: number | string; name: string };
  isBreakPackFilter: boolean;
}) {
  const [combinations, setCombinations] = React.useState(_combinations);
  const { productCombinationState } = useStore();
  const [selected, setSelected] = React.useState<ProductCombinations | null>(
    null,
  );

  const [toggle, handleToggle] = useToggle({
    breakPackModal: false,
    stockAdjustmentModal: false,
  });

  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      ...variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: () => {
          return variant.isBreakpackFilter ? (
            <Badge variant="secondary">{variant.name}</Badge>
          ) : (
            variant.name
          );
        },
        meta: {
          headerClassName: cx({
            "italic underline font-bold": variant.isBreakpackFilter,
          }),
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          const x = row.original.values.findIndex(
            (i) => i.variantTypeId === variants[idx].id,
          );

          return row.original.values[x]?.value;
        },
      })),
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return (
            <div
              className={cx("font-bold", {
                "text-red-500": row.original.price == 0,
              })}
            >
              {formatCurrency(row.original.price)}
            </div>
          );
        },
      },
      {
        accessorKey: "averagePrice",
        header: "Average Price",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return formatCurrency(Number(row.original.inventory.averagePrice));
        },
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => (
          <span
            className={cx({
              "font-bold text-red-500": row.original.inventory.quantity == 0,
            })}
          >
            {Number(row.original.inventory.quantity)}
          </span>
        ),
      },
      {
        accessorKey: "conversionFactor",
        header: "Conversion Factor",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right text-xs",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => (
          <div>{Number(row.original.conversionFactor)}</div>
        ),
      },
      {
        header: "Re-order Level",
        accessorKey: "reorderLevel",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right text-xs",
        },
      },
      {
        accessorKey: "stockAdjustment",
        header: "Stock Adjustment",
        meta: {
          className: "w-0",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ stockAdjustmentModal: true });
              }}
            >
              <Pencil />
            </Button>
            {Number(row.original?.inventory?.quantity) === 0 ||
            row.original?.inventory?.quantity === undefined ? (
              <Tooltip content="Quantity must be more than 1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-sm"
                  disabled
                  onClick={() => {
                    setSelected(row.original);
                    handleToggle({ breakPackModal: true });
                  }}
                >
                  <PackageOpen />
                </Button>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-sm"
                onClick={() => {
                  setSelected(row.original);
                  handleToggle({ breakPackModal: true });
                }}
              >
                <PackageOpen />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [handleToggle, variants],
  );

  React.useEffect(() => {
    let combinations = [];

    if (selectedCombination.name !== "ALL") {
      if (isBreakPackFilter) {
        combinations = _combinations.filter((v) =>
          v.values.find((v) => v.id === selectedCombination.id),
        );
      } else {
        combinations = _combinations.filter(
          (v) => v.name === selectedCombination.name,
        );
      }
    } else {
      combinations = _combinations;
    }

    setCombinations(combinations);
  }, [
    _combinations,
    isBreakPackFilter,
    selectedCombination,
    selectedCombination.name,
  ]);

  return (
    <>
      <DataTable
        data={combinations}
        columns={columns}
        meta={{
          disabledRow: "isActive",
        }}
      />

      {toggle.breakPackModal && ( // && selected
        <BreakPackModal
          isOpen={true}
          onClose={() => {
            handleToggle({ breakPackModal: false });
          }}
          combination={selected as ProductCombinations}
          onSubmit={async () => {
            getData();
            productCombinationState.invalidate();
            handleToggle({ breakPackModal: false });
          }}
        />
      )}
      {toggle.stockAdjustmentModal && (
        <StockAdjustmentModal
          isOpen={true}
          onClose={() => {
            getData();
            handleToggle({ stockAdjustmentModal: false });
          }}
          combinationId={Number(selected?.id)}
          onSubmit={async () => {
            // handleToggle({ stockAdjustmentModal: false });
            // navigate(`${ROUTES.PRODUCTS}/${productId}`);
          }}
        />
      )}
    </>
  );
}
