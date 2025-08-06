import { categoryServices, productServices } from "@/services";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/definitions";
import { Form } from "@/components/ui/form";
import { useCategoryStore } from "@/stores";
import { useNavigate } from "react-router";
import ProductForm from "./ProductForm";
import Modal from "@/components/Modal";
import { Product } from "@/types";
import React from "react";

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
    defaultValues: {
      categoryId,
    },
  });
  const navigate = useNavigate();

  async function onSubmit(values: Product) {
    // const payload = {
    //   ...values,
    //   combinations: values.combinations.map((i) => {
    //     return {
    //       id: i.id,
    //       sku: i.sku,
    //       price: i.price,
    //       inventory: i.inventory,
    //       values: i.values.map((v) => {
    //         return v.value;
    //       }),
    //     };
    //   }),
    //   variants: values.variants.map((i) => {
    //     return {
    //       id: i.id,
    //       name: i.name,
    //       productId: i.productId,
    //       values: i.values.map((v) => {
    //         return v.value;
    //       }),
    //     };
    //   }),
    // };

    const product = await productServices.create(values);
    console.log(product);
    navigate(`${ROUTES.PRODUCTS}/${product.id}/edit`);
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
            console.log(form.formState.errors);
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
