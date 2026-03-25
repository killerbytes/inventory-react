import { ProductCombination, ProductWithCombinations } from "@/schemas";
import StockAdjustmentModal from "./StockAdjustmentModal";
import { ComboboxItem } from "@/pages/Products/Details";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import BreakPackModal from "./BreakPackModal";
import useToggle from "@/hooks/useToggle";
import Combination from "./Combination";
import { CogIcon } from "lucide-react";
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
  product,
  selectedCombination,
}: {
  product: ProductWithCombinations;
  selectedCombination: ComboboxItem | undefined;
}) {
  const [combinations, setCombinations] = React.useState(
    groupSubItems(product.combinations),
  );
  const [selected, setSelected] = React.useState<ProductCombination | null>(
    null,
  );

  const [toggle, handleToggle] = useToggle({
    breakPackModal: false,
    stockAdjustmentModal: false,
    combinationModal: false,
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
      // ...(product.variants || []).map((variant) => ({
      //   accessorKey: "values.values." + variant.name,
      //   header: () => {
      //     return variant.isBreakpackFilter ? (
      //       <Badge variant="secondary">{variant.name}</Badge>
      //     ) : (
      //       variant.name
      //     );
      //   },
      //   meta: {
      //     headerClassName: cx({
      //       "italic underline font-bold": variant.isBreakpackFilter,
      //     }),
      //   },
      //   cell: ({ row }: { row: Row<ProductCombination> }) => {
      //     const x = row.original.values.findIndex(
      //       (i) => i.variantTypeId === variant.id,
      //     );

      //     return row.original.values[x]?.value;
      //   },
      // })),
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
            {/* <Button
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
            </Button> */}
            {/* {Number(row.original?.inventory?.quantity) === 0 ||
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
            )} */}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ combinationModal: true });
              }}
            >
              <CogIcon />
            </Button>
          </div>
        ),
      },
    ],
    [handleToggle, product.variants],
  );

  React.useEffect(() => {
    if (!selectedCombination) {
      setCombinations(groupSubItems(product.combinations));
      return;
    }

    let combinations = product.combinations.filter(
      (v) => v.id === selectedCombination.id,
    );

    setCombinations(groupSubItems(combinations));
  }, [product.combinations, selectedCombination]);

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
      {toggle.combinationModal && selected && (
        <Combination
          product={product}
          selected={selected}
          isOpen={true}
          onClose={() => {
            handleToggle({ combinationModal: false });
          }}
          onSubmit={async () => {
            handleToggle({ combinationModal: false });
          }}
        />
      )}
    </>
  );
}
