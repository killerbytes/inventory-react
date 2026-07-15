import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ApiErrorResponse,
  Invoice,
  invoiceFormSchema,
  InvoiceLine,
  PaymentApplication,
} from "@/schemas";
import PaymentTab from "@/features/invoices/components/PaymentTab";
import { useInvoice } from "@/features/invoices/hooks/useInvoices";
import { ERROR, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link, useNavigate, useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import ColorBadge from "@/components/ColorBadge";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import React from "react";

export default function Details() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useInvoice(Number(id));

  if (isError) {
    const apiError = error as unknown as ApiErrorResponse;
    if (apiError.code === ERROR.NOT_FOUND) {
      navigate(ROUTES.INVOICES);
    }
    toast.error("Server Error - " + apiError.message);
  }

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
  });

  React.useEffect(() => {
    form.reset(data);
  }, [data, form]);

  const remainingBalance = data?.applications.reduce(
    (acc: number, val: PaymentApplication) => {
      return acc + Number(val.amountApplied);
    },
    0,
  );

  const columns: ColumnDef<InvoiceLine>[] = React.useMemo(
    () => [
      {
        accessorKey: "goodReceipt.referenceNo",
        header: "Reference",
        cell: ({ row }) => (
          <Link
            className="text-primary"
            to={`${ROUTES.GOOD_RECEIPT}/${row.original.goodReceipt?.id}`}
          >
            {row.original.goodReceipt?.referenceNo}
          </Link>
        ),
      },
      // {
      //   accessorKey: "goodReceipt.status",
      //   header: "Status",
      //   cell: ({ row }) => (
      //     <ColorBadge colorMap={STATUS_COLOR}>
      //       {String(row.original.goodReceipt?.status)}
      //     </ColorBadge>
      //   ),
      // },

      {
        header: "Receipt Date",
        accessorKey: "goodReceipt.receiptDate",
        cell: ({ row }) =>
          formatDate(String(row.original.goodReceipt?.receiptDate)),
      },
      {
        accessorKey: "amount",
        header: () => "Amount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("amount")),
      },
    ],
    [],
  );

  if (isLoading) return <Loader />;
  return (
    <>
      <PageHeader title={`Invoice Number: #${data?.invoiceNumber}`}>
        <ColorBadge colorMap={STATUS_COLOR}>{String(data?.status)}</ColorBadge>
      </PageHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex">
            <div className="w-1/3">
              <Label className="text-muted-foreground">Invoice Date</Label>
              <div className="font-semibold text-sm">
                {data?.invoiceDate ? formatDate(data?.invoiceDate) : "-"}
              </div>
            </div>
            <div className="w-1/3">
              <Label className="text-muted-foreground">Due Date</Label>
              <div className="font-semibold text-sm">
                {formatDate(data?.dueDate ?? "")}
              </div>
            </div>
            <div className="w-1/3">
              <Label className="text-muted-foreground">Remaining Balance</Label>
              <div className="font-semibold text-sm">
                {formatCurrency(
                  Number(data?.totalAmount) - Number(remainingBalance ?? 0),
                )}
              </div>
            </div>
          </div>
          {data?.notes && (
            <div className="w-full">
              <Label className="text-muted-foreground">Notes</Label>
              <div className="font-semibold text-sm">{data?.notes}</div>
            </div>
          )}
        </div>
        <Tabs defaultValue="invoice">
          <TabsList>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="invoice">
            <DataTable
              data={data?.invoiceLines || []}
              columns={columns}
              renderFooter={(rows: InvoiceLine[]) => {
                return (
                  <TableRow>
                    <TableCell className="font-semibold">Total:</TableCell>
                    <TableCell
                      className="font-semibold text-right"
                      colSpan={10}
                    >
                      {formatCurrency(
                        rows.reduce((acc, val) => acc + Number(val.amount), 0),
                      )}
                    </TableCell>
                  </TableRow>
                );
              }}
            />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentTab data={data as Invoice} />
          </TabsContent>
        </Tabs>
      </div>
      <Loader isLoading={isLoading} />
    </>
  );
}
