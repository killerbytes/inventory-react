import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { supplierServices } from "@/services";
import { supplierHistory } from "@/types";
import { Link } from "react-router";
import React from "react";

export default function SupplierHistory({
  productId,
  selectedCombination,
  isBreakPackFilter,
}: {
  productId: string;
  selectedCombination: { id: number | string; name: string };
  isBreakPackFilter: boolean;
}) {
  const [data, setData] = React.useState<supplierHistory[]>([]);

  const getData = React.useCallback(async () => {
    const res = await supplierServices.getByProductId(Number(productId));
    setData(res);
  }, [productId]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const columns = React.useMemo<ColumnDef<supplierHistory>[]>(
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
    if (selectedCombination.id === -1) {
      return data || [];
    }

    return isBreakPackFilter
      ? data?.filter((item) =>
          item.combinations.values.find(
            (values) => values.id === selectedCombination.id,
          ),
        ) || []
      : data?.filter(
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
      data={filteredData}
      columns={columns}
      meta={{
        disabledRow: {
          "combinations.deletedAt": true,
        },
      }}
    />
  );
}
