import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ApiError,
  ApiErrorResponse,
  Category,
  categoryBaseSchema,
  CategoryInput,
} from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { categoryServices } from "@/services";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { Trash2 } from "lucide-react";
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
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categoryBaseSchema),
    defaultValues: { ...data },
  });

  async function onSubmit(values: CategoryInput) {
    try {
      const { name, description } = values;
      await categoryServices.update(Number(data.id), { name, description });
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const { errors } = getErrorMessage(error as ApiErrorResponse);
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof CategoryInput, {
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

  async function handleRemove() {
    try {
      await categoryServices.delete(Number(data.id));
      toast.success(`Deleted: ${data.name}`);
      onClose();
    } catch {
      toast.error("Deletion failed");
    } finally {
      cb();
      onClose();
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
              <Button
                onClick={handleRemove}
                type="button"
                size="icon"
                variant="destructive"
                className="mr-auto"
              >
                <Trash2 />
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
