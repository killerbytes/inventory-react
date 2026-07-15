import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductCombination, ProductWithCombinations } from "@/schemas";
import { ClipboardList, Cog, PackageOpen } from "lucide-react";
import StockAdjustmentModal from "./StockAdjustmentModal";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import CombinationModal from "./CombinationModal";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import BreakPackModal from "./BreakPackModal";
import { groupSubItems } from "@/lib/utils";
import Tooltip from "@/components/Tooltip";
import useToggle from "@/hooks/useToggle";

import { hasRole, ROLES } from "@/utils/permissions";
import { useStore } from "@/stores";
import React from "react";
export default function CombinationsTab({
  product,
}: {
  product: ProductWithCombinations;
}) {
  const { authState } = useStore();

  const [selected, setSelected] = React.useState<ProductCombination | null>(
    null,
  );

  const [toggle, handleToggle] = useToggle({
    breakPackModal: false,
    stockAdjustmentModal: false,
    combinationModal: false,
    createCombinationModal: false,
    editCombinationModal: false,
  });

  const combinations = React.useMemo(() => {
    return groupSubItems(product.combinations);
  }, [product.combinations]);

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

      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          const price = row.original.price ?? 0;
          const avgPrice = Number(row.original.inventory?.averagePrice ?? 0);
          const error = (price > 0 && avgPrice >= price) || price == 0;
          return (
            <div
              className={cx("font-bold", {
                "text-red-500": error,
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
        accessorKey: "actions",
        header: "",
        meta: {
          className: "w-0",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => (
          <div className="flex gap-2">
            {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) && (
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
                <ClipboardList />
              </Button>
            )}
            {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) &&
              (Number(row.original?.inventory?.quantity) === 0 ||
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
              ))}
          </div>
        ),
      },
    ],
    [handleToggle, product.variants],
  );

  return (
    <>
      <Card>
        <CardHeader className="items-center justify-between flex">
          <CardTitle>Product Combinations</CardTitle>
          <CardAction>
            {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) && (
              <Button
                onClick={() => handleToggle({ editCombinationModal: true })}
                type="button"
                variant="secondary"
                className="shadow-sm"
              >
                <Cog />
                Edit Combinations
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="">
          <DataTable
            data={combinations}
            columns={columns}
            meta={{
              disabledRow: { isActive: false },
              subRows: "subItem",
            }}
          />
        </CardContent>
      </Card>

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

      {toggle.editCombinationModal && product && (
        <CombinationModal
          product={product}
          isOpen={true}
          onSubmit={() => {
            handleToggle({ editCombinationModal: false });
          }}
          onClose={() => {
            handleToggle({ editCombinationModal: false });
          }}
        />
      )}
    </>
  );
}
