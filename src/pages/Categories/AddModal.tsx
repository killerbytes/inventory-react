import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { categoryServices, type ApiError, type Category } from "@/services";
import { GlobalContext } from "@/components/GlobalContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categorySchema } from "@/schemas";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { useContext } from "react";
import { toast } from "sonner";
import * as z from "zod";

export default function AddModal({
  isOpen,
  onClose,
  cb,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
}) {
  const { invalidate } = useContext(GlobalContext) || {};
  const form = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "aaaaakillerbytes",
      description: "1234",
    },
  });

  async function onSubmit(values: Category) {
    try {
      const { name, description } = values;
      await categoryServices.create({ name, description });
      toast.success(`Submitted: ${values.name} (${values.description})`);
      form.reset();
      if (invalidate) {
        invalidate("categories");
      }
      onClose();
    } catch (error) {
      const { errors, message } = error.response.data;
      console.log(errors);
      errors.forEach((err: ApiError) => {
        if (err.field) {
          const field = err.field;
          form.setError(field, {
            type: "server",
            message: err.message,
          });
        }
      });
      toast.error(`Submission failed${message && `: ${message}`}`);
    } finally {
      cb();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Add Category"
      description="Add a new category to the system"
    >
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Description" {...field} />
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
  );
}
