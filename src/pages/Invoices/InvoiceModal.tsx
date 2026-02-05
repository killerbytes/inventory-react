import {
  ApiErrorResponse,
  GoodReceipt,
  Invoice,
  invoiceForm,
  InvoiceGoodReceipt,
  InvoiceLine,
  Supplier,
} from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ERROR, INVOICE_STATUS, STATUS_COLOR } from "@/utils/definitions";
import { useController, useFieldArray, useForm } from "react-hook-form";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { invoiceServices, supplierServices } from "@/services";
import GoodReceiptPickerModal from "./GoodReceiptPickerModal";
import { TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { invoiceFormSchema } from "@/schemas";
import useToggle from "@/hooks/useToggle";
import Modal from "@/components/Modal";
import { Plus } from "lucide-react";
import { addWeeks } from "date-fns";
import { useStore } from "@/stores";
import { toast } from "sonner";
import React from "react";
import { z } from "zod";

export default function InvoiceModal({
  data,
  isOpen,
  onClose,
}: {
  data: Invoice;
  isOpen: boolean;
  onClose: (boolean: boolean) => void;
}) {
  const {
    supplierState: { suppliers, setSuppliers },
  } = useStore();
  const { toggle, handleToggle } = useToggle({
    goodReceiptPickerModal: false,
  });

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      status: INVOICE_STATUS.DRAFT,
      invoiceDate: new Date().toISOString(),
      dueDate: addWeeks(new Date(), 2).toISOString(),
    },
  });

  const supplier = useController({
    name: "supplierId",
    control: form.control,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "gr",
    keyName: "fieldId",
  });

  React.useEffect(() => {
    const getData = async () => {
      const res = await invoiceServices.get(Number(data.id));
      const gr = res.invoiceLines.map((i: InvoiceLine) => ({
        ...i.goodReceipt,
      }));
      form.reset({
        ...res,
        gr,
      });
    };
    if (data) {
      getData();
    }
  }, [data, form]);

  React.useEffect(() => {
    const getData = async () => {
      const data: Supplier[] = await supplierServices.list();
      setSuppliers(data);
    };
    if (suppliers.length === 0) {
      getData();
    }
  }, [setSuppliers, suppliers.length]);

  const onPickerSubmit = (selected: InvoiceGoodReceipt[]) => {
    handleToggle({ goodReceiptPickerModal: false });
    form.setValue("gr", selected);
  };

  const onSubmit = async (values: z.infer<typeof invoiceFormSchema>) => {
    try {
      const { gr, ...rest } = values;
      const invoiceLines = gr.map((item) => ({
        goodReceiptId: Number(item.id),
        amount: Number(item.totalAmount) - Number(item.totalReturnAmount),
      }));

      const payload = {
        ...rest,
        status: INVOICE_STATUS.POSTED,
        invoiceLines,
        applications: [],
      };

      await invoiceServices.create(payload);

      toast.success(`Good Receipt created successfully`);
      onClose(true);
    } catch (error) {
      console.log(error);

      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof invoiceForm, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
    }
  };
  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "referenceNo",
        header: "Reference",
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
          const { totalAmount, totalReturnAmount } = row.original;
          return (
            <div
              className={cx({ "text-red-500": Number(totalReturnAmount) > 0 })}
            >
              {formatCurrency(Number(totalAmount) - Number(totalReturnAmount))}
            </div>
          );
        },
      },
    ],
    [],
  );
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => onClose(false)}
      title="Add Invoice"
      size="lg"
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>Supplier</FormLabel>
                  <Autocomplete
                    value={
                      suppliers.find((supplier) => supplier.id === field.value)
                        ?.name
                    }
                    options={suppliers}
                    placeholder="Supplier"
                    onChange={(value) => {
                      form.setValue("supplierId", Number(value.id), {
                        shouldValidate: true,
                      });
                    }}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier Invoice No." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>Invoice Date</FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button
              className="shadow-sm"
              type="button"
              size="sm"
              disabled={!supplier.field.value}
              onClick={() => handleToggle({ goodReceiptPickerModal: true })}
            >
              <Plus />
            </Button>
          </div>

          <FormField
            control={form.control}
            name="gr"
            render={() => (
              <FormItem className="w-full">
                <FormControl>
                  <ScrollArea
                    className="max-h-[280px]  rounded-md border"
                    tabIndex={-1}
                    autoFocus={false}
                  >
                    <DataTable
                      data={fields}
                      columns={columns}
                      showFooter
                      renderFooter={(rows: GoodReceipt[]) => {
                        return (
                          <TableRow className="font-bold">
                            <TableCell>Total Amount</TableCell>
                            <TableCell colSpan={10} className="text-right">
                              {formatCurrency(
                                rows?.reduce(
                                  (acc: number, item: GoodReceipt) =>
                                    acc +
                                    Number(item.totalAmount) -
                                    Number(item.totalReturnAmount),
                                  0,
                                ),
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    />
                  </ScrollArea>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {toggle.goodReceiptPickerModal && (
            <GoodReceiptPickerModal
              isOpen
              onClose={() => handleToggle({ goodReceiptPickerModal: false })}
              supplierId={Number(supplier.field.value)}
              onSubmit={(selected) => {
                onPickerSubmit(selected);
              }}
              defaultSelected={fields}
            />
          )}
          <DialogFooter>
            <ConfirmDialog
              title="Create Invoice"
              description="Are you sure you want to create this invoice? This action cannot be undone."
              onConfirm={() => {
                console.log(form.getValues(), form.formState.errors);
                form
                  .handleSubmit(onSubmit)()
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              }}
            >
              <Button className="shadow-sm">Create Invoice</Button>
            </ConfirmDialog>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
