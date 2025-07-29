import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { productServices } from "@/services";
import { ApiError, Product } from "@/types";
import { useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";
import validations from "@/schemas";
import { toast } from "sonner";

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
  const { name, description, categoryId, unit } = data;
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name,
      description,
      categoryId,
      unit,
    },
  });

  const handleSubmit = async (values: Product) => {
    try {
      const { name, description, categoryId, unit } = values;
      if (!data?.id) {
        throw new Error("Product ID is missing");
      }
      const payload = {
        name,
        description,
        categoryId,
        unit,
        parentId: data.id,
      };

      await productServices.create(payload);
      toast.success(`Submitted: ${values.name}`);
      onSubmit();
    } catch (error) {
      const { errors } = getErrorMessage(error);

      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof Product, {
            type: "server",
            message: err.message,
          });
        }
      });
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
          <Button type="submit">Create Repack</Button>
        </ProductForm>
      </Modal>
    </>
  );
}
