import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MODE_OF_PAYMENT } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { PurchaseOrder } from "@/services";
import { useForm } from "react-hook-form";

export default function Test() {
  const form = useForm<PurchaseOrder>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      modeOfPayment: MODE_OF_PAYMENT.CHECK,
    },
  });

  const {
    formState: { errors },
  } = form;

  const onSubmit = (values: PurchaseOrder) => {
    console.log(values);
  };

  return (
    <div className="p-2">
      Test
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <input type="text" name="username" />
          <FormField
            control={form.control}
            name="purchaseOrderNumber"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>PO #</FormLabel>
                <Input {...field} value={field.value ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkNumber"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Check Number</FormLabel>
                <Input {...field} value={field.value ?? ""} />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
