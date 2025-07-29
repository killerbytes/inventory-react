import { ApiError, Inventory, productServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductForm from "../Products/ProductForm";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import validations from "@/schemas";
import { toast } from "sonner";
import * as z from "zod";

export default function PackageModal({
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
  const { productSchema } = validations;
  const schema = productSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentId: data.productId,
      categoryId: data.product.categoryId,
      name: data.product.name + " (Unpacked)",
      description: data.product.description
        ? `${data.product.description} - (Unpacked)`
        : "Unpacked",
      reorderLevel: data.product.reorderLevel,
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await productServices.create(values);
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof z.infer<typeof schema>, {
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
        title="Unpack Product"
        description="Unpack existing product details"
      >
        <ProductForm
          form={form}
          onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
        />
      </Modal>
    </>
  );
}
