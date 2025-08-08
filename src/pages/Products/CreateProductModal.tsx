import { categoryServices, productServices } from "@/services";
import { ApiError, ApiErrorResponse, Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { ROUTES } from "@/utils/definitions";
import { Form } from "@/components/ui/form";
import { useCategoryStore } from "@/stores";
import { useNavigate } from "react-router";
import { productSchema } from "@/schemas";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import React from "react";

interface Exx {
  code: string;
  details: string;
  errors: Record<string, string[]>;
  message: string;
  statusCode: number;
}

export default function CreateProductModal({
  categoryId,
  isOpen,
  onClose,
}: {
  categoryId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { categories, setCategories } = useCategoryStore();

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      categoryId,
    },
  });
  const navigate = useNavigate();

  async function onSubmit(values: Product) {
    try {
      const product = await productServices.create(values);
      navigate(`${ROUTES.PRODUCTS}/${product.id}/edit`);
    } catch (error: unknown) {
      const { errors }: ApiErrorResponse = getErrorMessage(
        error as ApiErrorResponse,
      );
      errors?.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof Product, {
            type: "server",
            message: err.message,
          });
        }
      });
      const serverError = form.formState.errors["products_name_unit"];
      if (serverError) {
        form.setError("name", {
          type: "server",
          message: "Product with the same unit already exists",
        });
        form.setError("unit", {
          type: "server",
          message: "Unit with same product already exists",
        });
      }
    }
  }
  const data = useWatch({ control: form.control });

  React.useEffect(() => {
    const getData = async () => {
      const data = await categoryServices.list();
      setCategories(data);
    };
    if (categories.length === 0) {
      getData();
    }
  }, [categories.length, setCategories]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Add Product"
      description="Add a new product to the system"
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
        >
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            categories={categories}
          />
          <div className="flex justify-end gap-2">
            <Button>Create Product</Button>
          </div>
        </form>
      </Form>

      {JSON.stringify(data)}
    </Modal>
  );
}
