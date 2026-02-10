import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CancelOrder, cancelOrderSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";

export const CancelModal = ({
  onClose,
  onSubmit,
  isOpen,
}: {
  onClose: () => void;
  onSubmit: (form: CancelOrder) => void;
  isOpen: boolean;
}) => {
  const form = useForm<CancelOrder>({
    resolver: zodResolver(cancelOrderSchema),
  });

  const formSubmit = (form: CancelOrder) => {
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
          name="reason"
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
