import { ProductCombination, VariantTypes } from "@/schemas";
import StockAdjustmentModal from "./StockAdjustmentModal";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { PackageOpen, Pencil } from "lucide-react";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import BreakPackModal from "./BreakPackModal";
import Tooltip from "@/components/Tooltip";
import useToggle from "@/hooks/useToggle";
import { useStore } from "@/stores";
import React from "react";

interface ProductCombinationWithSubItem extends ProductCombination {
  subItem?: ProductCombinationWithSubItem[];
}

const groupSubItems = (
  items: ProductCombination[],
): ProductCombinationWithSubItem[] => {
  const itemRecord: Record<number, ProductCombinationWithSubItem> = {};
  items.forEach((item) => {
    itemRecord[item.id] = {
      ...item,
      subItem: undefined,
    };
  });
  const rootItems: ProductCombinationWithSubItem[] = [];
  Object.values(itemRecord).forEach((item) => {
    const parentId = item.isBreakPackOfId;
    if (parentId && itemRecord[parentId]) {
      itemRecord[parentId].subItem = [item];
    } else {
      rootItems.push(item);
    }
  });

  return rootItems;
};

export default function Combinations({
  combinations: _combinations,
  variants,
  selectedCombination,
}: {
  combinations: ProductCombination[];
  variants: VariantTypes[];
  selectedCombination: T | undefined;
}) {
  const [combinations, setCombinations] = React.useState(
    groupSubItems(_combinations),
  );
  const { productCombinationState } = useStore();
  const [selected, setSelected] = React.useState<ProductCombination | null>(
    null,
  );

  const [toggle, handleToggle] = useToggle({
    breakPackModal: false,
    stockAdjustmentModal: false,
  });

  const columns = React.useMemo<ColumnDef<ProductCombination>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: { row: Row<ProductCombination> }) => (
          <div
            style={{
              paddingLeft: `${row.depth}rem`,
            }}
          >
            <div className="flex items-center gap-1">
              <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
              {row.original.name}
            </div>
          </div>
        ),
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
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          const x = row.original.values.findIndex(
            (i) => i.variantTypeId === variants[idx].id,
          );

          return row.original.values[x]?.value;
        },
      })),
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return (
            <div
              className={cx("font-bold", {
                "text-red-500": row.original.price == 0,
              })}
            >
              {formatCurrency(row.original.price ?? 0)}
            </div>
          );
        },
      },
      {
        accessorKey: "averagePrice",
        header: "Average Price",
        cell: ({ row }: { row: Row<ProductCombination> }) => {
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
        cell: ({ row }: { row: Row<ProductCombination> }) => (
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
        cell: ({ row }: { row: Row<ProductCombination> }) => (
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
        cell: ({ row }: { row: Row<ProductCombination> }) => (
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
    if (!selectedCombination) {
      setCombinations(groupSubItems(_combinations));
      return;
    }

    let combinations = _combinations.filter(
      (v) => v.id === selectedCombination.id,
    );

    setCombinations(groupSubItems(combinations));
  }, [_combinations, selectedCombination]);

  return (
    <>
      <DataTable
        data={combinations}
        columns={columns}
        meta={{
          disabledRow: { isActive: false },
          subRows: "subItem",
        }}
      />

      {toggle.breakPackModal && (
        <BreakPackModal
          isOpen={true}
          onClose={() => {
            handleToggle({ breakPackModal: false });
          }}
          combination={selected as ProductCombination}
          onSubmit={async () => {
            productCombinationState.invalidate();
            handleToggle({ breakPackModal: false });
          }}
        />
      )}
      {toggle.stockAdjustmentModal && (
        <StockAdjustmentModal
          isOpen={true}
          onClose={() => {
            handleToggle({ stockAdjustmentModal: false });
          }}
          combinationId={Number(selected?.id)}
          onSubmit={async () => {}}
        />
      )}
    </>
  );
}
