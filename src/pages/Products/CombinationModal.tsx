import {
  ApiErrorResponse,
  Inventory,
  Product,
  productCombinationBaseSchema,
  ProductCombinationInput,
  ProductCombinations,
  VariantTypes,
  VariantValues,
} from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, useFieldArray, useForm, useWatch } from "react-hook-form";
import { ERROR, UNIT_COLOR, UNIT_OPTIONS } from "@/utils/definitions";
import { Loader2Icon, Plus, Trash2 } from "lucide-react";
import { productCombinationServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import Select from "@/components/Select";
import VariantCell from "./VariantCell";
import Modal from "@/components/Modal";
import React, { useMemo } from "react";
import { useStore } from "@/stores";
import last from "lodash/last";
import { toast } from "sonner";
import * as z from "zod";

type CombinationTableRow = ProductCombinationInput & {
  inventory?: Inventory;
};

export default function CombinationModal({
  product,
  onClose,
  isOpen,
}: {
  product: Product;
  onSubmit: (e: Product) => Promise<void>;
  onClose: (shouldReload: boolean) => void;
  isOpen: boolean;
}) {
  const [loading, setLoading] = React.useState(false);
  const [shouldReload, setShouldReload] = React.useState(false);
  const {
    productCombinationState: { invalidate },
  } = useStore();
  const [variants, setVariants] = React.useState<VariantTypes[]>([]);
  const [combinations, setCombinations] = React.useState<ProductCombinations[]>(
    [],
  );

  const form = useForm<{
    combinations: ProductCombinationInput[];
  }>({
    defaultValues: {
      combinations: [],
    },
    resolver: zodResolver(
      z.object({
        combinations: z.array(productCombinationBaseSchema),
      }),
    ),
  });

  const { append, remove } = useFieldArray({
    control: form.control,
    name: "combinations",
    keyName: "fieldId",
  });

  const watchCombinations = useWatch({
    control: form.control,
    name: "combinations",
  });

  const tableData: CombinationTableRow[] = watchCombinations.map((i) => {
    const row = combinations.find((f) => f.id === i.id);
    return { ...i, inventory: row?.inventory };
  });

  const productCombinationDefaultValue: ProductCombinationInput = {
    productId: Number(product.id),
    reorderLevel: 10,
    unit: product.baseUnit,
    price: 0,
    conversionFactor: 1,
    isActive: true,
    values: variants.map(() => ({
      value: "",
      variantTypeId: null,
      id: null,
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
      setCombinations(combinations);
    }
  }, [form, product.id]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleSubmit = async (data: {
    combinations: ProductCombinationInput[];
  }) => {
    const { combinations } = data;

    try {
      setLoading(true);
      await productCombinationServices.updateByProductId(
        Number(product.id),
        combinations,
      );
      invalidate();
      setShouldReload(true);
      toast.success("Variants saved successfully");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err, index) => {
          if (err.field) {
            form.setError(
              `combinations.${index}.${err.field}` as FieldPath<{
                combinations: ProductCombinationInput[];
              }>,
              {
                type: "server",
                message: err.message,
              },
            );
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<CombinationTableRow>[]>(
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

        cell: (props) => {
          const { row, table } = props;
          const type = variants.find(
            (item: VariantTypes) => item.isBreakpackFilter,
          );
          let options: CombinationTableRow[] = [];
          const allOriginalData = table
            .getRowModel()
            .rows.map((row) => row.original);

          if (type) {
            const f = row.original.values.find(
              (v) => v.variantTypeId === type.id,
            );
            options = allOriginalData.filter((i) =>
              i.values.find((v) => v.id === f?.id),
            );
          } else {
            options = allOriginalData.filter((i) => i.id !== row.original.id);
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
                      onChange={(value) => {
                        field.onChange(Number(value));
                      }}
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
          return Number(row.original.inventory?.quantity ?? 0);
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
                      value={field.value}
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
                      checked={field.value || false}
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
                      checked={field.value || false}
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
    ],
    [form, remove, variants],
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => onClose(shouldReload)}
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
                  <div className="rounded-md border   max-h-[50vh] overflow-y-auto ">
                    <DataTable data={tableData} columns={columns} />
                  </div>
                </FormControl>
                <div></div>

                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="flex justify-between! items-center text-left flex-row">
            <Button
              type="button"
              variant="outline"
              className="shadow-sm rounded-full"
              size="icon"
              autoFocus
              onClick={() => {
                const lastItem = last(watchCombinations);
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
          </DialogFooter>
        </form>
      </Form>
      {/* {JSON.stringify(x)} */}
    </Modal>
  );
}
