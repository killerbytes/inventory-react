import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import { toast } from "sonner";
import * as z from "zod";

import { productServices, type ApiError, type Product } from "@/services";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";

export default function AddModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "aaaaakillerbytes",
      categoryId: 1,
      description: "1234",
      reorderLevel: 100,
    },
  });

  async function handleSubmit(values: z.infer<typeof productSchema>) {
    try {
      await productServices.create(values);
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onSubmit();
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof z.infer<typeof productSchema>, {
            type: "server",
            message: err.message,
          });
        }
      });

      toast.error("Submission failed");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Add Product"
      description="Add a new product to the system"
    >
      <ProductForm
        form={form}
        onSubmit={(e) => {
          e.preventDefault();
          console.log(form.getValues(), form.formState.errors);
          form
            .handleSubmit(handleSubmit)(e)
            .catch((error) => {
              console.error("Form submission error:", error);
            });
        }}
      >
        <Button type="submit">Save changes</Button>
      </ProductForm>
    </Modal>
  );
}
