import CombinationFilter, { SelectedCombination } from "./CombinationFilter";
import { useSupplierHistory } from "@/hooks/useSupplierHistory";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { SupplierHistory } from "@/schemas";
import { Link } from "react-router";
import React from "react";

export default function SupplierHistoryTab({
  productId,
  selectedCombination,
  setSelectedCombination,
  uniqueCombinations,
}: {
  productId: string;
  selectedCombination: SelectedCombination | undefined;
  setSelectedCombination: (value: SelectedCombination) => void;
  uniqueCombinations: SelectedCombination[];
}) {
  const { data = [] } = useSupplierHistory(Number(productId));

  const columns = React.useMemo<ColumnDef<SupplierHistory>[]>(
    () => [
      {
        accessorKey: "combinations.name",
        header: "Name",
        meta: {},
      },
      {
        header: "Unit",
        accessorKey: "unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.unit)}
            </ColorBadge>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        accessorKey: "purchasePrice",
        header: "Price",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          return formatCurrency(row.original.purchasePrice);
        },
      },

      {
        accessorKey: "goodReceipt.supplier.name",
        header: "Supplier",
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary"
              to={`/suppliers/${row.original.goodReceipt.supplierId}`}
            >
              {row.original.goodReceipt.supplier.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "goodReceipt.id",
        header: "Good Receipt",
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary"
              to={`${ROUTES.GOOD_RECEIPT}/${row.original.goodReceipt.id}`}
            >
              {row.original.goodReceipt.id}
            </Link>
          );
        },
      },
      {
        accessorKey: "goodReceipt.receiptDate",
        header: "Date",
        cell: ({ row }) => {
          return formatDate(row.original.goodReceipt.receiptDate);
        },
      },
    ],
    [],
  );
  const filteredData = React.useMemo(() => {
    if (!selectedCombination) {
      return data || [];
    }
    return (
      data?.filter((item) => item.combinations.id === selectedCombination.id) ||
      []
    );
  }, [data, selectedCombination]);

  return (
    <>
      <CombinationFilter
        uniqueCombinations={uniqueCombinations}
        selectedCombination={selectedCombination}
        setSelectedCombination={setSelectedCombination}
      />
      <DataTable
        data={filteredData}
        columns={columns}
        meta={{
          disabledRow: {
            "combinations.deletedAt": true,
          },
        }}
      />
    </>
  );
}
