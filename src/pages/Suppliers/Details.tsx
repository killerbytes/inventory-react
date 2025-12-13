import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { goodReceiptServices, supplierServices } from "@/services";
import { ApiErrorResponse, GoodReceipt, Supplier } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES, STATUS_COLOR } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router";
import { cx } from "class-variance-authority";
import { getReturnAmount } from "@/lib/utils";
import { toast } from "sonner";
import React from "react";

export default function SupplierDetails() {
  const { id } = useParams();
  const [data, setData] = React.useState<Supplier>();
  const [supplier, setSupplier] = React.useState<Supplier>();
  const getData = React.useCallback(async () => {
    try {
      const data: GoodReceipt[] = await goodReceiptServices.getBySupplier(
        id,
        {},
      );

      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.message);
    }
  }, [id]);
  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    const getSupplier = async () => {
      const supplier = await supplierServices.get(Number(id));
      setSupplier(supplier);
    };
    getSupplier();
  }, [id]);

  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "referenceNo",
        header: "Reference",
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary"
              to={ROUTES.GOOD_RECEIPT_DETAILS.replace(":id", row.original.id)}
            >
              {row.original.referenceNo}
            </Link>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <ColorBadge colorMap={STATUS_COLOR}>{String(status)}</ColorBadge>
          );
        },
      },

      {
        header: "Receipt Date",
        accessorKey: "receiptDate",
        cell: ({ row }) => formatDate(row.getValue("receiptDate")),
      },

      {
        accessorKey: "totalAmount",
        header: () => "Total Amount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { totalAmount } = row.original;
          const returnAmount = getReturnAmount(row.original);

          return (
            <div className={cx({ "text-red-500": Number(returnAmount) > 0 })}>
              {formatCurrency(Number(totalAmount) - returnAmount)}
            </div>
          );
        },
      },
    ],
    [],
  );
  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{supplier?.name}</CardTitle>
          <CardDescription>
            {supplier?.address}
            <br />
            {supplier?.phone}
          </CardDescription>
          <CardAction>
            <Button disabled>Create Invoice</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable data={data || []} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
