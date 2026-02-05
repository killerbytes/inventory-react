import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ApiErrorResponse, Invoice, Payment } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import NumberInput from "@/components/NumberInput";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paymentServices } from "@/services";
import { ERROR } from "@/utils/definitions";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  paymentDate: z.string(),
  referenceNo: z.string(),
  amount: z.coerce.number(),
  notes: z.string().nullish(),
});

export default function AddPaymentModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: Invoice;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNo: "",
      //   amount: 0,
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await paymentServices.create({
        ...values,
        supplierId: data.supplierId,
        applications: [
          {
            invoiceId: Number(data.id),
            amountApplied: values.amount,
          },
        ],
      } as Payment);
      onClose();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof z.infer<typeof formSchema>, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} title="Add Payment">
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log(form.getValues(), form.formState.errors);
            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
        >
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference No</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Check no., Bank transfer no."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={String(field.value ?? "")}
                    placeholder="eg: Paid via check"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <NumberInput
                    {...field}
                    type="currency"
                    allowNegative={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button className="shadow-sm" type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
