import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ApiErrorResponse, GoodReceipt, Invoice, Supplier } from "@/types";
import { ERROR, INVOICE_STATUS, STATUS_COLOR } from "@/utils/definitions";
import { useController, useFieldArray, useForm } from "react-hook-form";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { invoiceServices, supplierServices } from "@/services";
import GoodReceiptPickerModal from "./GoodReceiptPickerModal";
import { TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupplierStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import { invoiceSchema } from "@/schemas";
import InvoiceForm from "./InvoiceForm";
import Modal from "@/components/Modal";
import { addWeeks } from "date-fns";
import { toast } from "sonner";
import React from "react";
export default function AddInvoiceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "INV001",
      supplierId: 1,
      status: INVOICE_STATUS.DRAFT,
      invoiceDate: new Date().toISOString(),
      dueDate: addWeeks(new Date(), 2).toISOString(),
    },
  });

  const onSubmit = async (values: Invoice) => {
    try {
      await invoiceServices.create(values);

      toast.success(`Good Receipt created successfully`);
      onClose(true);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof Invoice, {
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

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} title="Add Invoice" size="lg">
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const { invoiceLines } = form.getValues();
            console.log(form.getValues(), form.formState.errors);
            // const totalAmount = invoiceLines.reduce(
            //   (acc: number, item: GoodReceipt) =>
            //     acc + parseFloat(item.totalAmount ?? "0"),
            //   0,
            // );
            // form.setValue("totalAmount", String(totalAmount));
            form.setValue(
              "invoiceLines",
              invoiceLines.map((item) => ({
                goodReceiptId: item.id,
                amount: Number(item.totalAmount),
              })),
            );

            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
        >
          <InvoiceForm form={form} />
          <DialogFooter>
            <Button className="shadow-sm" type="submit">
              Save as Draft
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
