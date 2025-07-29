import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { categoryServices, type ApiError, type Category } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categorySchema } from "@/schemas";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { toast } from "sonner";

export default function EditModal({
  isOpen,
  onClose,
  cb,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
  data: Category;
}) {
  const form = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: { ...data },
  });

  async function onSubmit(values: Category) {
    try {
      const { name, description } = values;
      await categoryServices.update(String(data.id), { name, description });
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof Category, {
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
        title="Edit Category"
        description="Update the category details"
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
                    <Textarea placeholder="Description" {...field} />
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
