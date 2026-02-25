import {
  ApiError,
  ApiErrorResponse,
  productBaseSchema,
  ProductInput,
} from "@/schemas";
import { categoryServices, productServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES, UNIT } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";
import { useStore } from "@/stores";
import React from "react";

export default function CreateProductModal({
  categoryId,
  isOpen,
  onClose,
}: {
  categoryId?: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    categoryState: { categories, setCategories },
  } = useStore();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productBaseSchema),

    defaultValues: {
      categoryId,
      name: "",
      baseUnit: UNIT.PCS,
    },
  });
  const navigate = useNavigate();

  async function onSubmit(values: ProductInput) {
    try {
      const product = await productServices.create(values);
      navigate(`${ROUTES.PRODUCTS}/${product.id}`);
    } catch (error: unknown) {
      const { errors }: ApiErrorResponse = getErrorMessage(
        error as ApiErrorResponse,
      );
      errors?.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof ProductInput, {
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
      }
    }
  }
  // const data = useWatch({ control: form.control });

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

      {/* {JSON.stringify(data)} */}
    </Modal>
  );
}
