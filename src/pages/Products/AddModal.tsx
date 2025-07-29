import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import { toast } from "sonner";
import * as z from "zod";

import { ApiError, ApiErrorResponse, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { productServices } from "@/services";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";

export default function AddModal({
  isOpen,
  onClose,
  onSubmit,
  categoryId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  categoryId: number | undefined;
}) {
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "aaaaakillerbytes",
      categoryId,
      description: "1234",
    },
  });

  async function handleSubmit(values: z.infer<typeof productSchema>) {
    try {
      await productServices.create(values);
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onSubmit();
    } catch (error) {
      const { errors } = getErrorMessage(error as ApiErrorResponse);
      errors?.forEach((err: ApiError) => {
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
