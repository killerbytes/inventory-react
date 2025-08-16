import {
  ProductCombinations,
  Product,
  VariantValues,
  VariantTypes,
  ApiErrorResponse,
  ApiError,
} from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { productCombinationServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCombinationsSchema } from "@/schemas";
import { SelectItem } from "@/components/ui/select";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { ERROR } from "@/utils/definitions";
import { Plus, Trash2 } from "lucide-react";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import React, { useMemo } from "react";
import { toast } from "sonner";
import * as z from "zod";

export default function CombinationModal({
  product,
  onClose,
  isOpen,
}: {
  product: Product;
  onSubmit: (e: Product) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}) {
  const [variants, setVariants] = React.useState<VariantTypes[]>([]);
  const form = useForm<{
    combinations: ProductCombinations[];
  }>({
    defaultValues: {
      combinations: [],
    },
    resolver: zodResolver(
      z.object({
        combinations: z.array(productCombinationsSchema),
      }),
    ),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "combinations",
    keyName: "fieldId",
  });

  const x = useWatch({
    control: form.control,
    name: "combinations",
  });

  const productCombinationDefaultValue = {
    productId: product.id,
    price: Number("123.00"),
    reorderLevel: 10,
    values: variants.map((i) => ({
      variantTypeId: i.id,
    })),
  };

  const getData = React.useCallback(async () => {
    if (product.id) {
      const { combinations, variants } =
        await productCombinationServices.getByProductId(product.id);
      form.reset({
        combinations,
      });
      setVariants(variants);
    }
  }, [form, product.id]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleSubmit = async (values: {
    combinations: ProductCombinations[];
  }) => {
    try {
      await productCombinationServices.updateByProductId(
        Number(product.id),
        values,
      );
      toast.success("Variants saved successfully");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field, err.message);
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
    }
  };

  const columns = useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        accessorKey: "id",
        header: "#",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="outline"
            disabled={(row.original.inventory?.quantity ?? 0) > 0}
          >
            <Trash2 />
          </Button>
        ),
      },
      ...variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        meta: {
          className: "w-0",
        },
        cell: ({
          row: {
            original: { values },
            index,
          },
        }: {
          row: {
            original: {
              values: VariantValues[];
            };
            index: number;
          };
        }) => {
          const x = values.findIndex(
            (i) => i.variantTypeId === variants[idx].id,
          );
          return (
            <Controller
              name={`combinations.${index}.values.${x}`}
              control={form.control}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    value={String(
                      variant.values.find((i) => i.id === field.value.id)?.id,
                    )}
                    options={variant.values}
                    onChange={(value) => {
                      field.onChange(
                        variant.values.find((v) => v.id === Number(value)),
                      );
                    }}
                    renderOption={(option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.value}
                      </SelectItem>
                    )}
                  />
                );
              }}
            />
          );
        },
      })),
      {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <Controller
              name={`combinations.${row.index}.price`}
              control={form.control}
              render={({ field }) => <NumberInput {...field} type="currency" />}
            />
          );
        },
      },
      {
        accessorKey: "reorderLevel",
        header: () => <div className="text-right">Re-order Level</div>,
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <Controller
              name={`combinations.${row.index}.reorderLevel`}
              control={form.control}
              render={({ field }) => <NumberInput {...field} />}
            />
          );
        },
      },
      // {
      //   header: () => <div className="text-center">Qty</div>,
      //   accessorKey: "inventory.quantity",
      //   meta: {
      //     className: "text-center",
      //   },
      // },
    ],
    [form.control, remove, variants],
  );
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title={`Product: ${product.name}`}
      description="Manage product variants"
      className="!max-w-[90%]"
    >
      <Form {...form}>
        <form
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
          <FormField
            control={form.control}
            name="combinations"
            render={() => (
              <FormItem className="mb-2">
                <FormLabel>Product Variants</FormLabel>
                <FormControl>
                  <DataTable data={fields} columns={columns} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex mb-8">
            <Button
              className="shadow-sm"
              type="button"
              variant="outline"
              onClick={() => {
                append(productCombinationDefaultValue);
              }}
            >
              <Plus /> Add Variant
            </Button>
          </div>

          <div className="flex justify-end">
            <Button className="shadow-sm" type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Form>
      {/* {JSON.stringify(x)} */}
    </Modal>
  );
}
