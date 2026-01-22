import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";
import BreakPackModal from "@/components/modals/BreakPackModal";
import { ProductCombinations, VariantTypes } from "@/types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { PackageOpen, Pencil } from "lucide-react";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import Tooltip from "@/components/Tooltip";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import { useStore } from "@/stores";
import React from "react";

const defaultOption = { id: -1, value: "ALL" };
export default function Combinations({
  combinations,
  variants,
  getData,
}: {
  combinations: ProductCombinations[];
  variants: VariantTypes[];
  getData: () => void;
}) {
  const { productCombinationState } = useStore();
  const [selected, setSelected] = React.useState<ProductCombinations | null>(
    null,
  );
  const [selectedBreakPackVariant, setSelectedBreakPackVariant] =
    React.useState<{ id?: number; value: string; variantTypeId?: string }>(
      defaultOption,
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
        header: variant.name,
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
            <div className={cx({ "text-red-500": row.original.price == 0 })}>
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
          <div>{Number(row.original.inventory.quantity)}</div>
        ),
      },
      {
        accessorKey: "conversionFactor",
        header: "Conversion Factor",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
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
          className: "w-0 text-right",
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

  const breakPackVariantOptions = React.useMemo(
    () => [
      defaultOption,
      ...(variants.find((i) => i.isBreakpackFilter)?.values || []),
    ],
    [variants],
  );

  console.log(selectedBreakPackVariant.value);

  return (
    <>
      <Select
        options={breakPackVariantOptions}
        value={String(selectedBreakPackVariant.id)}
        onChange={(value) => {
          const selected = breakPackVariantOptions.find(
            (i) => String(i.id) === value,
          );

          setSelectedBreakPackVariant(selected);
        }}
        renderOption={(option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.value}
          </SelectItem>
        )}
      />

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
