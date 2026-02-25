import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ApiErrorResponse,
  Invoice,
  invoiceFormSchema,
  InvoiceLine,
  PaymentApplication,
} from "@/schemas";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ERROR, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link, useNavigate, useParams } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Label } from "@/components/ui/label";
import { invoiceServices } from "@/services";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import PaymentTab from "./PaymentTab";
import { toast } from "sonner";
import React from "react";

export default function Details() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Invoice>();
  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
  });

  React.useEffect(() => {
    form.reset(data);
  }, [data, form]);

  const getData = React.useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        const data = await invoiceServices.get(id);
        setData(data);
      } catch (error) {
        const apiError = error as ApiErrorResponse;
        if (apiError.code === ERROR.NOT_FOUND) {
          navigate(ROUTES.INVOICES);
        }
        toast.error("Server Error - " + apiError.message);
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  React.useEffect(() => {
    getData(Number(id));
  }, [getData, id]);

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

  if (!data) return <Loader isLoading={loading} />;
  return (
    <div className="flex flex-col gap-4 relative">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Invoice Details
          </CardTitle>
          <CardAction className="flex gap-2">
            <ColorBadge colorMap={STATUS_COLOR}>
              {String(data?.status)}
            </ColorBadge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="w-1/3">
                <Label>Invoice Number</Label>
                <div className="font-semibold text-sm">
                  {data?.invoiceNumber}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Invoice Date</Label>
                <div className="font-semibold text-sm">
                  {data?.invoiceDate ? formatDate(data?.invoiceDate) : "-"}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Due Date</Label>
                <div className="font-semibold text-sm">
                  {formatDate(data?.dueDate ?? "")}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Remaining Balance</Label>
                <div className="font-semibold text-sm">
                  {formatCurrency(
                    Number(data?.totalAmount) - Number(remainingBalance ?? 0),
                  )}
                </div>
              </div>
            </div>
            <div className="w-full">
              <Label>Notes</Label>
              <div className="font-semibold text-sm">{data?.notes}</div>
            </div>
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
                          rows.reduce(
                            (acc, val) => acc + Number(val.amount),
                            0,
                          ),
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentTab data={data} cb={getData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Loader isLoading={loading} />
    </div>
  );
}
