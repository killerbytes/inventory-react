import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cancelPurchaseOrderSchema } from "@/schemas";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { z } from "zod";

export const CancelModal = ({
  onClose,
  onSubmit,
  isOpen,
}: {
  onClose: () => void;
  onSubmit: (form: z.infer<typeof cancelPurchaseOrderSchema>) => void;
  isOpen: boolean;
}) => {
  const form = useForm<z.infer<typeof cancelPurchaseOrderSchema>>({
    resolver: zodResolver(cancelPurchaseOrderSchema),
  });

  const formSubmit = (form: z.infer<typeof cancelPurchaseOrderSchema>) => {
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Cancel Purchase Order"
      description="Are you sure you want to cancel this purchase order?"
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name="cancellationReason"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter some notes..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button
            onClick={(e) => {
              console.log(form.formState.errors, form.getValues());
              e.preventDefault();
              form.handleSubmit(formSubmit)(e);
            }}
            variant="destructive"
          >
            Confirm
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
