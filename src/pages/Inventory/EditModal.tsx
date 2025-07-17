import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { inventoryServices, type Inventory, type Product } from "@/services";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";

export default function EditModal({
  isOpen,
  onClose,
  cb,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
  data: Inventory;
}) {
  const form = useForm<Inventory>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      ...data,
    },
  });

  interface ApiError {
    field?: string;
    message: string;
  }

  async function onSubmit(values: Inventory) {
    try {
      await inventoryServices.updatePrice(data.id, values);
      toast.success(`Submitted: ${values.product.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof Inventory, {
            type: "server",
            message: err.message,
          });
        }
      });
      toast.error("Submission failed");
    } finally {
      cb();
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Edit Price"
        description="Update existing price"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              try {
                console.log(form.formState.errors);
                e.preventDefault();
                form
                  .handleSubmit(onSubmit)(e)
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              } catch (error) {
                console.log("alet", error);
              }
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
