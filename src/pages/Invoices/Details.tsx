import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ERROR,
  INVOICE_STATUS,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { Ban, EllipsisVertical, Save, Trash2 } from "lucide-react";
import { ApiErrorResponse, Invoice, InvoiceLine } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { invoiceFormSchema, invoiceSchema } from "@/schemas";
import { TableCell, TableRow } from "@/components/ui/table";
import { Link, useNavigate, useParams } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { invoiceServices } from "@/services";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import PaymentTab from "./PaymentTab";
import { toast } from "sonner";
import React from "react";
import { z } from "zod";

export default function Details() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState();
  const { toggle, handleToggle } = useToggle({
    cancelModal: false,
    dropdownMenu: false,
  });
  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
  });

  React.useEffect(() => {
    form.reset(data);
  }, [data]);

  const getData = async (id: number) => {
    try {
      const data = await invoiceServices.get(id);
      setData(data);
      // form.reset({ ...data, invoiceLines });
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.NOT_FOUND) {
        navigate(ROUTES.INVOICES);
      }
      toast.error("Server Error - " + apiError.message);
    }
  };
  React.useEffect(() => {
    getData(Number(id));
  }, [id]);

  const onDeleteOrder = async () => {
    await invoiceServices.delete(Number(id));
    navigate(ROUTES.INVOICES);
  };
  const onSave = async (values: z.infer<typeof invoiceFormSchema>) => {
    try {
      setLoading(true);
      const invoiceLines = values.gr.map((item) => ({
        goodReceiptId: item.id,
        amount: Number(item.totalAmount),
      }));
      await invoiceServices.update(Number(id), { ...values, invoiceLines });
      toast.success(`Invoice saved successfully`);
      await getData(Number(id));
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof invoiceFormSchema>) => {
    try {
      const invoiceLines = values.gr?.map((item) => ({
        goodReceiptId: item.id,
        amount: Number(item.totalAmount),
      }));
      await invoiceServices.update(Number(id), {
        ...values,
        invoiceLines,
        status: INVOICE_STATUS.POSTED,
      });
      toast.success(`Invoice saved successfully`);
      navigate(ROUTES.INVOICES);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  };

  const remainingBalance = data?.applications.reduce((acc, val) => {
    return acc + parseFloat(val.amountApplied ?? "0");
  }, 0);

  const columns: ColumnDef<InvoiceLine>[] = React.useMemo(
    () => [
      {
        accessorKey: "goodReceipt.referenceNo",
        header: "Reference",
        cell: ({ row }) => (
          <Link to={`${ROUTES.GOOD_RECEIPT}/${row.original.goodReceipt?.id}`}>
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
            <DropdownMenu
              open={toggle.dropdownMenu}
              onOpenChange={() => {
                handleToggle({ dropdownMenu: false });
              }}
            >
              <DropdownMenuTrigger
                asChild
                onClick={() => handleToggle({ dropdownMenu: true })}
              >
                <Button variant="outline" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* {data?.status !== INVOICE_STATUS.DRAFT && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleToggle({ cancelModal: true, dropdownMenu: false });
                    }}
                  >
                    <Ban color="red" />
                    Cancel Order
                  </DropdownMenuItem>
                )} */}
                {data?.status === INVOICE_STATUS.DRAFT && (
                  <>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        const { invoiceLines } = form.getValues();
                        form.setValue(
                          "invoiceLines",
                          invoiceLines.map((item) => ({
                            goodReceiptId: item.id,
                            amount: Number(item.totalAmount),
                          })),
                        );

                        console.log(form.formState.errors);
                        form
                          .handleSubmit(onSave)(e)
                          .catch((error) => {
                            console.error("Form submission error:", error);
                          });

                        handleToggle({
                          dropdownMenu: false,
                        });
                      }}
                    >
                      <Save color="green" />
                      Save
                    </DropdownMenuItem>
                    <ConfirmDialog
                      title={`Void order`}
                      onConfirm={onDeleteOrder}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 color="red" />
                        Void
                      </DropdownMenuItem>
                    </ConfirmDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
                  {formatDate(data?.dueDate)}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Remaining Balance</Label>
                <div className="font-semibold text-sm">
                  {formatCurrency(
                    parseFloat(data?.totalAmount) - remainingBalance,
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
                showFooter
                renderFooter={(rows: InvoiceLine[]) => {
                  return (
                    <TableRow>
                      <TableCell className="font-semibold" colSpan={2}>
                        Total:
                      </TableCell>
                      <TableCell className="font-semibold text-right">
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
