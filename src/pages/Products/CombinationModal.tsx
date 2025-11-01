import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Product,
  VariantValues,
  VariantTypes,
  ApiErrorResponse,
  ProductCombinations,
} from "@/types";
import { ERROR, UNIT_COLOR, UNIT_OPTIONS } from "@/utils/definitions";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2Icon, Plus, Trash2 } from "lucide-react";
import { productCombinationServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductCombinationStore } from "@/stores";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { variantValuesSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import Select from "@/components/Select";
import VariantCell from "./VariantCell";
import Modal from "@/components/Modal";
import React, { useMemo } from "react";
import last from "lodash/last";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  id: z.number().nullish(),
  productId: z.number(),
  unit: z.string(),
  conversionFactor: z.coerce.number().min(1, {
    message: "Conversion Factor must be at least 1.",
  }),
  price: z.coerce.number().nullish(),
  reorderLevel: z.coerce.number(),
  isBreakPack: z.boolean().nullish(),
  isActive: z.boolean().nullish(),
  isBreakPackOfId: z.coerce.number().nullish(),
  values: z.array(variantValuesSchema),
});

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
  const [loading, setLoading] = React.useState(false);
  const { invalidate } = useProductCombinationStore();
  const [variants, setVariants] = React.useState<VariantTypes[]>([]);
  const form = useForm<{
    combinations: z.infer<typeof formSchema>[];
  }>({
    defaultValues: {
      combinations: [],
    },
    resolver: zodResolver(
      z.object({
        combinations: z.array(formSchema),
      }),
    ),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "combinations",
    keyName: "fieldId",
  });

  const x: z.infer<typeof formSchema>[] = useWatch({
    control: form.control,
    name: "combinations",
  });

  const productCombinationDefaultValue: z.infer<typeof formSchema> = {
    productId: Number(product.id),
    reorderLevel: 10,
    unit: product.baseUnit,
    price: 0,
    conversionFactor: 1,
    isActive: false,
    values: variants.map((i) => ({
      variantTypeId: i.id,
    })),
  };

  const getData = React.useCallback(async () => {
    if (product.id) {
      const {
        combinations,
        variants,
      }: { combinations: ProductCombinations[]; variants: VariantTypes[] } =
        await productCombinationServices.getByProductId(product.id);
      const map = combinations.map((i) => i.values);
      const x = combinations.map((i) => {
        return {
          ...i,
          values: Array(variants.length).fill({ id: "" }),
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

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await productCombinationServices.updateByProductId(
        Number(product.id),
        values as ProductCombinations[],
      );
      invalidate();
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
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        accessorKey: "id",
        header: "#",
        meta: {
          className: "text-right w-0",
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
          headerClassName: cx({
            "italic underline font-bold": variant.isBreakpackFilter,
          }),
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
            <VariantCell
              control={form.control}
              form={form}
              index={index}
              idx={idx}
              variant={variant}
            />
          );
        },
      })),

      {
        accessorKey: "unit",
        header: "Unit",
        meta: {
          headerClassName: "text-left",
          className: "text-left w-0",
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
                      tabIndex={-1}
                      disabled={
                        !form
                          .watch(`combinations.${row.index}.values`)
                          ?.every((v) => v?.id)
                      }
                      value={String(field.value)}
                      options={UNIT_OPTIONS}
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
        accessorKey: "isBreakPackOfId",
        meta: {
          className: "text-right w-0",
        },

        cell: ({ row }) => {
          const type = variants.find(
            (item: VariantTypes) => item.isBreakpackFilter,
          );
          let options: z.infer<typeof formSchema>[] = [];
          if (type) {
            const f = row.original.values.find(
              (v) => v.variantTypeId === type.id,
            );

            const exists = x
              .filter((i) => i.isBreakPackOfId)
              .map((i) => i.isBreakPackOfId);

            options = x.filter((i) => i.values.find((v) => v.id === f?.id));
            options = options.filter(
              (o) =>
                !exists.includes(o.id!) ||
                o.id === row.original.isBreakPackOfId,
            );
          }

          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.isBreakPackOfId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      {...field}
                      tabIndex={-1}
                      value={String(field.value)}
                      options={options.filter((o) => o.id !== row.original.id)}
                      renderOption={(option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.values[0]?.value} {option.values[1]?.value}
                          <ColorBadge colorMap={UNIT_COLOR}>
                            {String(option.unit)}
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
        accessorKey: "price",
        header: "Price",
        meta: {
          headerClassName: "text-right",
          className: "text-right w-30 min-w-[100px]",
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
        accessorKey: "inventory.quantity",
        header: "Qty",
        meta: {
          className: "text-left w-[50px]",
        },
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {Number(row.original.inventory?.quantity)}
            </div>
          );
        },
      },
      {
        accessorKey: "conversionFactor",
        header: "Conversion Factor",
        meta: {
          headerClassName: "text-left",
          className: "text-left w-[50px]",
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.conversionFactor`}
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <NumberInput
                      {...field}
                      decimalScale={2}
                      tabIndex={-1}
                      value={parseFloat(field.value)}
                    />
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
                    <NumberInput {...field} tabIndex={-1} />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },
      {
        accessorKey: "isBreakPack",
        header: "isBreakPack",
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.isBreakPack`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Checkbox
                      {...field}
                      tabIndex={-1}
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                      }}
                      value={String(field.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "isActive",
        meta: {
          className: "text-right w-0",
        },

        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`combinations.${row.index}.isActive`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Checkbox
                      {...field}
                      tabIndex={-1}
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                      }}
                      value={String(field.value)}
                    />
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
    [form, remove, variants, x],
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
                  <ScrollArea className="rounded-md border">
                    <DataTable
                      data={fields}
                      columns={columns}
                      errors={form.formState.errors}
                      showFooter={false}
                    />
                  </ScrollArea>
                </FormControl>
                <div></div>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="shadow-sm"
              autoFocus
              onClick={() => {
                const lastItem = last(x);
                const unit = lastItem
                  ? lastItem.unit
                  : productCombinationDefaultValue.unit;
                append({
                  ...productCombinationDefaultValue,
                  unit,
                });
                // form.setFocus("combinations.3.values");
              }}
            >
              <Plus />
            </Button>
            <Button className="shadow-sm" type="submit" disabled={loading}>
              {loading && <Loader2Icon className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </Form>
      {/* {JSON.stringify(x)} */}
    </Modal>
  );
}
