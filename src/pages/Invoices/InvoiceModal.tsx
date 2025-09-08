import { goodReceiptSchema, invoiceFormSchema, invoiceSchema } from "@/schemas";
import { ERROR, INVOICE_STATUS } from "@/utils/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { ApiErrorResponse, Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { invoiceServices } from "@/services";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import InvoiceForm from "./InvoiceForm";
import Modal from "@/components/Modal";
import { addWeeks } from "date-fns";
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
  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      // invoiceNumber: "INV001",
      supplierId: 1,
      status: INVOICE_STATUS.DRAFT,
      invoiceDate: new Date().toISOString(),
      dueDate: addWeeks(new Date(), 2).toISOString(),
    },
  });
  React.useEffect(() => {
    const getData = async () => {
      const res = await invoiceServices.get(data.id);
      const gr = res.invoiceLines.map((i) => ({ ...i.goodReceipt }));
      form.reset({
        ...res,
        gr,
      });
    };
    getData();
  }, [data, form]);

  console.log(form.getValues());

  const onSave = async (values) => {
    console.log(values);
    invoiceServices.update(data.id, values);
  };

  const onSubmit = async (values: z.infer<typeof invoiceFormSchema>) => {
    try {
      const invoiceLines = values.gr.map((item) => ({
        goodReceiptId: item.id,
        amount: Number(item.totalAmount),
      }));
      await invoiceServices.create({ ...values, invoiceLines });

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
    <Modal
      isOpen={isOpen}
      onOpenChange={() => onClose(false)}
      title="Add Invoice"
      size="lg"
    >
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
            // form.setValue(
            //   "invoiceLines",
            //   invoiceLines.map((item) => ({
            //     goodReceiptId: item.id,
            //     amount: Number(item.totalAmount),
            //   })),
            // );

            form
              .handleSubmit(data ? onSave : onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
        >
          <InvoiceForm form={form} />
          <DialogFooter>
            <Button className="shadow-sm" type="submit">
              Update
            </Button>
            <Button className="shadow-sm">Save as Draft</Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
