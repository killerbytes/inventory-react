import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ProductCombinations,
  Product,
  VariantValues,
  VariantTypes,
  ApiErrorResponse,
} from "@/types";
import {
  BASE_UNIT,
  BASE_UNIT_OPTIONS,
  ERROR,
  UNIT_COLOR,
  UNIT_OPTIONS,
} from "@/utils/definitions";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import { productCombinationServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCombinationsSchema } from "@/schemas";
import { SelectItem } from "@/components/ui/select";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
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

  const productCombinationDefaultValue: ProductCombinations = {
    productId: Number(product.id),
    reorderLevel: 10,
    price: 0,
    values: variants.map((i) => ({
      variantTypeId: i.id,
      value: "",
    })),
  };

  const getData = React.useCallback(async () => {
    if (product.id) {
      const {
        combinations,
        variants,
      }: { combinations: ProductCombinations[]; variants: VariantTypes[] } =
        await productCombinationServices.getByProductId(product.id);
      await productCombinationServices.getByProductId(product.id);

      const map = combinations.map((i) => i.values);
      const x = combinations.map((i) => {
        return {
          ...i,
          values: Array(variants.length).fill(null),
        };
      });

      const xx = x.map((i, index) => {
        map[index].forEach((j) => {
          const idx = variants.findIndex((v) => v.id === j.variantTypeId);
          i.values[idx] = j;
        });
        return { ...i };
      });

      form.reset({
        combinations: xx,
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
            type="button"
            tabIndex={-1}
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
          row: { index },
        }: {
          row: {
            original: {
              values: VariantValues[];
            };
            index: number;
          };
        }) => {
          return (
            <Controller
              name={`combinations.${index}.values.${idx}`}
              control={form.control}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    value={String(
                      variant.values.find((i) => i.id === field.value?.id)?.id,
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
        accessorKey: "unit",
        header: () => <div className="text-right">Unit</div>,
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.unit`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      {...field}
                      value={String(field.value)}
                      options={[...BASE_UNIT_OPTIONS, ...UNIT_OPTIONS]}
                      renderOption={(unit) => (
                        <SelectItem key={unit.value} value={String(unit.value)}>
                          <ColorBadge colorMap={UNIT_COLOR}>
                            {String(unit.label)}
                          </ColorBadge>
                        </SelectItem>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },
      {
        accessorKey: "conversionFactor",
        header: () => <div className="text-right">Conversion Factor</div>,
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.conversionFactor`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput {...field} type="currency" />
                  </FormControl>
                </FormItem>
              )}
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
            <FormField
              control={form.control}
              name={`combinations.${row.index}.reorderLevel`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput {...field} />
                  </FormControl>
                </FormItem>
              )}
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
                  <DataTable
                    data={fields}
                    columns={columns}
                    errors={form.formState.errors}
                    showFooter={true}
                    renderFooter={() => (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Button
                            type="button"
                            variant="outline"
                            className="shadow-sm"
                            onClick={() =>
                              append(productCombinationDefaultValue)
                            }
                          >
                            <Plus />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
