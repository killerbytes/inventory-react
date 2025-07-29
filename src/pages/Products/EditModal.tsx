import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { productServices } from "@/services";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";
import { Trash2 } from "lucide-react";
import { Product } from "@/types";
import { toast } from "sonner";

export default function EditModal({
  isOpen,
  onClose,
  onSubmit,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  data: Product;
}) {
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...data,
    },
  });

  interface ApiError {
    field?: string;
    message: string;
  }

  async function handleSubmit(values: Product) {
    try {
      const { name, description, categoryId, unit } = values;
      if (!data.id) {
        throw new Error("Product ID is missing");
      }
      await productServices.update(String(data.id), {
        name,
        description,
        categoryId,
        unit,
      });
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onSubmit();
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof Product, {
            type: "server",
            message: err.message,
          });
        }
      });
      toast.error("Submission failed");
    }
  }

  async function handleRemove() {
    const { id, name } = data;
    try {
      await productServices.delete(String(id));
      toast.success(`Product [${name}] deleted`);
      onSubmit();
    } catch (error) {
      const { message } = getErrorMessage(error);
      toast.error("Deletion failed: " + message);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Edit Product"
        description="Update existing product details"
      >
        <ProductForm
          state="EDIT"
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
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={handleRemove}
          >
            <Trash2 size={16} />
          </Button>

          <Button type="submit">Save changes</Button>
        </ProductForm>
      </Modal>
    </>
  );
}
