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
  categorySchema,
} from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { categoryServices } from "@/services";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { useStore } from "@/stores";
import { toast } from "sonner";

export default function AddModal({
  isOpen,
  onClose,
  cb,
  selected,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
  selected?: Category;
}) {
  const {
    categoryState: { invalidate },
  } = useStore();
  const form = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      ...(selected && { parentId: selected.id }),
    },
  });

  async function onSubmit(values: Category) {
    try {
      await categoryServices.create({ ...values, parentId: selected?.id });
      toast.success(`Submitted: ${values.name} (${values.description})`);
      form.reset();
      invalidate();
      onClose();
    } catch (error) {
      const { errors } = getErrorMessage(error as ApiErrorResponse);
      errors.forEach((err: ApiError) => {
        if (err.field) {
          const field = err.field as keyof Category;
          form.setError(field, {
            type: "server",
            message: err.message,
          });
        }
      });
      // toast.error(`Submission failed${message && `: ${message}`}`);
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
            console.log(form.getValues(), form.formState.errors);

            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
          className="space-y-8"
        >
          <div className="mb-4 font-semibold">{selected?.name}</div>
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
