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
import { CancelPurchaseOrder } from "@/types";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";

export const CancelModal = ({
  onClose,
  onSubmit,
  isOpen,
}: {
  onClose: () => void;
  onSubmit: (form: CancelPurchaseOrder) => void;
  isOpen: boolean;
}) => {
  const form = useForm<CancelPurchaseOrder>({
    resolver: zodResolver(cancelPurchaseOrderSchema),
  });

  const formSubmit = (form: CancelPurchaseOrder) => {
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
