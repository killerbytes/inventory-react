import { formatCurrency, formatDate } from "@/utils/formatters";
import { GoodReceiptItem, PaginatedResponse } from "@/types";
import { ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { supplierServices } from "@/services";
import { Link } from "react-router";
import React from "react";

export default function ProductHistory({ productId }: { productId: string }) {
  const [data, setData] = React.useState<PaginatedResponse<GoodReceiptItem>[]>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const getData = React.useCallback(async () => {
    const res = await supplierServices.getByProductId(Number(productId));
    setData(
      res.combinations.reduce(
        (acc, val) => [...acc, ...val.goodReceiptLines],
        [],
      ),
    );
  }, [productId]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const columns = React.useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      {
        accessorKey: "nameSnapshot",
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
  return <DataTable data={data} columns={columns} />;
}
