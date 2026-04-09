import { useProductCombinationsByCategoryId } from "../hooks/useProductCombination";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { ProductCombination } from "@/schemas";
import BarcodePrinter from "./BarcodePrinter";
import useToggle from "@/hooks/useToggle";
import { Link } from "react-router";
import React from "react";

export function LazyProductsByCategory({ itemId }: { itemId: string }) {
  const { data, isLoading: productsLoading } =
    useProductCombinationsByCategoryId(Number(itemId));

  const { toggle, handleToggle } = useToggle({
    printBarcodeModal: false,
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
            <Link to={`/products/${row.original.product.id}`}>
              <div className="flex items-center gap-1">
                <ColorBadge colorMap={UNIT_COLOR}>
                  {row.original.unit}
                </ColorBadge>
                {row.original.name}
              </div>
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return row.original.sku;
        },
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return Number(row.original.inventory?.quantity);
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        meta: {
          headerClassName: "h-0",
          className: "w-20",
        },
        cell: ({ row }: { row: Row<ProductCombination> }) => {
          return formatCurrency(row.original.price ?? 0);
        },
      },
    ],
    [],
  );
  return (
    <>
      {productsLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                handleToggle({ printBarcodeModal: true });
              }}
            >
              Print Barcode
            </Button>
          </div>
          <DataTable
            data={data || []}
            columns={columns}
            meta={{
              disabledRow: { isActive: false },
              emptyText: "No combinations found",
            }}
          />

          <BarcodePrinter
            isOpen={toggle.printBarcodeModal || false}
            onClose={() => {
              handleToggle({ printBarcodeModal: false });
            }}
            items={data || []}
          />
        </div>
      )}
    </>
  );
}
