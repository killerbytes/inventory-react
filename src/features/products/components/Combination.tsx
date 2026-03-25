import {
  useCreateProductCombination,
  useDeleteProductCombination,
  useUpdateProductCombination,
} from "../hooks/useProductCombination";
import {
  ApiErrorResponse,
  Product,
  ProductCombination,
  ProductCombinationInput,
  productCombinationInputSchema,
} from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldPath, useForm } from "react-hook-form";
import CombinationForm from "./CombinationForm";
import { ERROR } from "@/utils/definitions";
import useToggle from "@/hooks/useToggle";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import React from "react";

export default function Combination({
  product,
  onClose,
  isOpen,
  selected,
}: {
  product: Product;
  onSubmit: (e: Product) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  selected: ProductCombination;
}) {
  const { mutate: createProductCombination } = useCreateProductCombination();
  const { mutate: updateProductCombination } = useUpdateProductCombination();
  const { mutate: deleteProductCombination } = useDeleteProductCombination();

  const values = React.useMemo(() => {
    if (!product.variants) return;
    return product.variants.map((i) => {
      const v = selected.values.find((j) => j.variantTypeId === i.id);

      return v ? v : { id: null, variantTypeId: i.id, value: "" };
    });
  }, [selected]);

  const isBreakpackFilter = product.variants?.find((i) => i.isBreakpackFilter);

  const setPrimaryValues = React.useMemo(() => {
    if (!isBreakpackFilter) return;
    return values?.map((i) => {
      if (i.variantTypeId === isBreakpackFilter.id) {
        return { ...i, disabled: true };
      }
      return i;
    });
  }, [values]);

  const form = useForm<ProductCombinationInput>({
    resolver: zodResolver(productCombinationInputSchema),
    values: {
      ...selected,
      values: selected.isBreakPackOfId
        ? (setPrimaryValues ?? [])
        : (values ?? []),
    },
  });

  const { toggle, handleToggle } = useToggle({
    addBreakpackForm: false,
  });

  const formAdd = useForm<ProductCombinationInput>({
    resolver: zodResolver(productCombinationInputSchema),
    defaultValues: {
      productId: Number(product.id),
      reorderLevel: 10,
      unit: product.baseUnit,
      price: 0,
      conversionFactor: 1,
      isActive: true,
      isBreakPack: true,
      isBreakPackOfId: selected.id,
      values: setPrimaryValues,
    },
  });

  const handleAddBreakpack = async (values: ProductCombinationInput) => {
    createProductCombination(
      { values },
      {
        onSuccess: () => {
          toast.success("Breakpack added successfully");
          handleToggle({ addBreakpackForm: false });
        },
        onError: (error: unknown) => {
          const apiError = error as ApiErrorResponse;

          if (apiError.code === ERROR.VALIDATION_ERROR) {
            apiError.errors.forEach((err) => {
              if (err.field) {
                form.setError(err.field as FieldPath<ProductCombinationInput>, {
                  type: "server",
                  message: err.message,
                });
              }
            });
          } else {
            toast.error("Failed to add breakpack: " + apiError.message);
          }
        },
      },
    );
  };

  const handleUpdate = async (values: ProductCombinationInput) => {
    updateProductCombination(
      {
        values,
      },
      {
        onSuccess: () => {
          toast.success("Combination saved successfully");
        },
        onError: (error: unknown) => {
          const apiError = error as ApiErrorResponse;

          if (apiError.code === ERROR.VALIDATION_ERROR) {
            apiError.errors.forEach((err) => {
              if (err.field) {
                console.log(err);

                form.setError(err.field as FieldPath<ProductCombinationInput>, {
                  type: "server",
                  message: err.message,
                });
              }
            });
          } else {
            toast.error("Failed to update combination: " + apiError.message);
          }
        },
      },
    );
  };

  const handleRemove = () => {
    deleteProductCombination(
      { id: selected.id },
      {
        onSuccess: () => {
          toast.success("Combination deleted successfully");
          onClose();
        },
        onError: (error) => {
          toast.error("Failed to delete combination: " + error.message);
        },
      },
    );
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title={`Product: ${selected.name}`}
        description="Manage product combination"
        className="!max-w-[90%]"
      >
        <CombinationForm
          product={product}
          form={form}
          handleSubmit={handleUpdate}
          handleRemove={handleRemove}
          handleAdd={() => handleToggle({ addBreakpackForm: true })}
        />
      </Modal>

      {toggle.addBreakpackForm && (
        <Modal
          isOpen={true}
          onOpenChange={() => handleToggle({ addBreakpackForm: false })}
          title={`Product: ${product.name}`}
          description="Manage product variants"
          className="!max-w-[90%]"
        >
          <CombinationForm
            product={product}
            form={formAdd}
            handleSubmit={handleAddBreakpack}
          />
        </Modal>
      )}
    </div>
  );
}
