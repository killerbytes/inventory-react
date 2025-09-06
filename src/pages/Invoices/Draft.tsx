import { DialogFooter } from "@/components/ui/dialog";
import { INVOICE_STATUS } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { GoodReceipt, Invoice } from "@/types";
import { Form } from "@/components/ui/form";
import InvoiceForm from "./InvoiceForm";

export default function Draft({
  form,
  onSubmit,
}: {
  form: UseFormReturn<Invoice>;
  onSubmit: (data: Invoice) => Promise<void>;
}) {
  const { status } = form.getValues();
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const { invoiceLines } = form.getValues();
          console.log(form.getValues(), form.formState.errors);
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
          {status === INVOICE_STATUS.DRAFT && (
            <Button className="shadow-sm" type="submit">
              Create Invoice
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
}
