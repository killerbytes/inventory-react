import { ApiError, productServices, type Product } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";
import validations from "@/schemas";
import { toast } from "sonner";
import * as z from "zod";

export default function NewPackageModal({
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
  const { productSchema } = validations;
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...data,
    },
  });

  const handleSubmit = async (values: Product) => {
    try {
      const { name, description, categoryId, unit, reorderLevel } = values;
      if (!data?.id) {
        throw new Error("Product ID is missing");
      }
      const payload = {
        name,
        description,
        categoryId,
        unit,
        reorderLevel,
        parentId: data.id,
      };

      await productServices.create(payload);
      toast.success(`Submitted: ${values.name}`);
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
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Repackage product"
        description={`Repackage ${data.name}`}
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
          <Button type="submit">Create Product</Button>
        </ProductForm>
      </Modal>
    </>
  );
}
