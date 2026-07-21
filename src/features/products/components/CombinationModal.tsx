import {
  ApiErrorResponse,
  ProductCombination,
  ProductCombinationInput,
  productCombinationInputSchema,
  ProductWithCombinations,
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
import { useUpdateProductCombinations } from "@/features/products/hooks/useProductCombination";
import { ERROR, UNIT_COLOR, UNIT_OPTIONS } from "@/utils/definitions";
import { FieldPath, useFieldArray, useForm } from "react-hook-form";
import { Loader2Icon, Plus, Save, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { groupSubItems } from "@/lib/utils";
import Select from "@/components/Select";
import VariantCell from "./VariantCell";
import Modal from "@/components/Modal";
import React, { useMemo } from "react";
import last from "lodash/last";
import { toast } from "sonner";
import * as z from "zod";

export default function CombinationModal({
  product: data,
  onSubmit,
  onClose,
  isOpen,
}: {
  product: ProductWithCombinations;
  onSubmit: () => void;
  onClose: () => void;
  isOpen: boolean;
}) {
  const { mutate: updateProductCombination, isPending } =
    useUpdateProductCombinations();

  const combinations = React.useMemo(() => {
    const combinations: ProductCombination[] = [];
    const getSubItem = (i: any) => {
      combinations.push(i);
      i?.subItem?.forEach((j: any) => {
        getSubItem(j);
      });
    };
    groupSubItems(data.combinations).forEach((i: any) => {
      getSubItem(i);
    });

    return combinations;
  }, [data.combinations]);

  const form = useForm<{
    combinations: ProductCombinationInput[];
  }>({
    resolver: zodResolver(
      z.object({
        combinations: z.array(productCombinationInputSchema),
      }),
    ),
    values: {
      combinations,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "combinations",
    keyName: "fieldId",
  });

  const productCombinationDefaultValue: ProductCombinationInput = {
    productId: Number(data.id),
    reorderLevel: 10,
    unit: data.baseUnit,
    price: 0,
    conversionFactor: 1,
    isActive: true,
    values:
      data.variants?.map(() => ({
        value: "",
        variantTypeId: null,
        id: null,
      })) ?? [],
  };

  const handleSubmit = async (values: {
    combinations: ProductCombinationInput[];
  }) => {
    const { combinations } = values;

    updateProductCombination(
      {
        productId: Number(data.id),
        data: combinations,
      },
      {
        onSuccess: () => {
          toast.success("Variants saved successfully");
          onSubmit();
        },
        onError: (error) => {
          const apiError = error as unknown as ApiErrorResponse;
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
        },
      },
    );
  };

  const columns = useMemo<ColumnDef<ProductCombinationInput>[]>(
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
      ...(data.variants ?? []).map((variant, idx) => ({
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
          const type = data.variants?.find(
            (item: VariantTypes) => item.isBreakpackFilter,
          );
          let options: ProductCombinationInput[] = [];
          const allOriginalData = table
            .getRowModel()
            .rows.map((row) => row.original);

          const selectedParentIds = allOriginalData
            .filter((_, index) => index !== row.index)
            .map((r) => r.isBreakPackOfId)
            .filter(Boolean);

          if (type) {
            const f = row.original.values.find(
              (v) => v.variantTypeId === type.id,
            );
            options = allOriginalData.filter(
              (i) =>
                i.values.find((v) => v.id === f?.id) &&
                !selectedParentIds.includes(i.id),
            );
          } else {
            options = allOriginalData.filter(
              (i) =>
                i.id !== row.original.id && !selectedParentIds.includes(i.id),
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
        accessorKey: "inventory.averagePrice",
        header: "Average Price",
        meta: {
          className: "text-left w-[50px]",
        },
        cell: ({ row }) => {
          return formatCurrency(
            Number(row.original.inventory?.averagePrice ?? 0),
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
    [form, remove, data.variants, fields],
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title={`Product: ${data.name}`}
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
                  <div className="rounded-md border max-h-[70vh] overflow-y-auto ">
                    <DataTable data={fields} columns={columns} />
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
                console.log(fields);

                const lastItem = last(fields);
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
            <Button className="shadow-sm" type="submit" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : <Save />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
