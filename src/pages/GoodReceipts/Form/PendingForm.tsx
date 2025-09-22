import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { ProductCombinations, GoodReceiptCreate, Supplier } from "@/types";
import { productCombinationServices, supplierServices } from "@/services";
import AmountColumn from "@/components/forms/OrderItemForm/AmountColumn";
import { useProductCombinationStore, useSupplierStore } from "@/stores";
import ProductLookupInput from "@/components/forms/ProductLookupInput";
import UnitColumn from "@/components/forms/OrderItemForm/UnitColumn";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { formatCurrency, getScore } from "@/utils/formatters";
import OrderItemForm from "@/components/forms/OrderItemForm";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import NumberInput from "@/components/NumberInput";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoodReceiptItem } from "@/types";
import { Trash2 } from "lucide-react";
import React from "react";

export default function PendingForm({
  form,
}: {
  form: UseFormReturn<GoodReceiptCreate>;
}) {
  const { suppliers, setSuppliers } = useSupplierStore();
  const productCombinationStore = useProductCombinationStore();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goodReceiptLines",
    keyName: "fieldId",
  });

  React.useEffect(() => {
    form.setFocus("supplierId");
  }, [form]);

  React.useEffect(() => {
    const getData = async () => {
      const data: Supplier[] = await supplierServices.list();
      setSuppliers(data);
    };
    if (suppliers.length === 0) {
      getData();
    }
  }, [setSuppliers, suppliers.length]);

  React.useEffect(() => {
    const getData = async () => {
      if (!productCombinationStore.hasLoaded) {
        const data = await productCombinationServices.list();
        productCombinationStore.setProductsCombinations(data);
      }
    };
    getData();
  }, [productCombinationStore]);
  const columns = React.useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      {
        accessorKey: "index",
        header: "",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="outline"
            type="button"
            tabIndex={-1}
          >
            <Trash2 />
          </Button>
        ),
      },
      {
        header: "id",
        accessorKey: "id",
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right w-20",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`goodReceiptLines.${row.index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        meta: {
          className: "w-15",
        },
        cell: ({ row }) => {
          return (
            <UnitColumn
              index={row.index}
              control={form.control}
              name="goodReceiptLines"
            />
          );
        },
      },
      {
        accessorKey: "combinationId",
        header: "Product",
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`goodReceiptLines.${row.index}.combinationId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ProductLookupInput
                      ariaInvalid={Boolean(
                        form.formState.errors?.goodReceiptLines?.[row.index]
                          ?.combinationId,
                      )}
                      items={
                        productCombinationStore.productCombinations as ProductCombinations[]
                      }
                      form={form}
                      {...field}
                      name="goodReceiptLines"
                      onChange={(value) => {
                        field.onChange(value.id);
                        form.setValue(
                          `goodReceiptLines.${row.index}.purchasePrice`,
                          value.price,
                        );

                        setTimeout(() => {
                          if (row.index + 1 === fields.length) {
                            const button: HTMLButtonElement | null =
                              document.querySelector(".append-btn");
                            if (button) {
                              button.focus();
                            }
                          } else {
                            form.setFocus(
                              `goodReceiptLines.${row.index + 1}.quantity`,
                            );
                          }
                        }, 0);
                      }}
                      renderOptions={({
                        items,
                        open,
                        setOpen,
                        onSelect,
                        search,
                      }) => {
                        return (
                          open &&
                          items
                            .map((item) => ({
                              item,
                              score: getScore(item.name, search),
                            }))
                            .filter(({ score }) => score > 0)
                            .sort((a, b) => b.score - a.score)
                            .map(({ item }) => (
                              <CommandGroup key={item.id}>
                                <CommandItem
                                  value={String(item.name + item.unit)}
                                  key={item.id}
                                  onSelect={() => {
                                    setOpen(false);
                                    onSelect?.(item);
                                  }}
                                  className="flex items-center gap-2 "
                                >
                                  <ColorBadge colorMap={UNIT_COLOR}>
                                    {item.unit}
                                  </ColorBadge>
                                  {item.name}
                                  <div className="flex gap-2 ml-auto">
                                    <span>{formatCurrency(item.price)}</span>
                                  </div>
                                </CommandItem>
                              </CommandGroup>
                            ))
                        );
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },

      {
        accessorKey: "discount",
        header: "Discount",
        meta: {
          className: "text-right w-32",
          type: "currency",
        },
        cell: ({ row }) => (
          <Controller
            name={`goodReceiptLines.${row.index}.discount`}
            control={form.control}
            render={({ field }) => <NumberInput {...field} type="currency" />}
          />
        ),
      },
      {
        accessorKey: "discountNote",
        header: "Discount Note",
        meta: {
          className: "w-50",
        },
        cell: ({ row }) => (
          <Controller
            name={`goodReceiptLines.${row.index}.discountNote`}
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ? String(field.value) : undefined}
              />
            )}
          />
        ),
      },
      {
        accessorKey: "purchasePrice",
        header: "Price",
        meta: {
          className: "text-right min-w-[100px] w-[110px]",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`goodReceiptLines.${row.index}.purchasePrice`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput
                    {...field}
                    // value={Number(field.value)}
                    type="currency"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        header: "Average Price",
        cell: ({ row }) => {
          const { quantity, purchasePrice, discount } = row.original;
          const priceAfterDiscount =
            (quantity * purchasePrice - discount) / quantity;

          return formatCurrency(priceAfterDiscount);
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right w-20",
        },

        cell: ({ row }) => (
          <AmountColumn
            index={row.index}
            control={form.control}
            name="goodReceiptLines"
          />
        ),
      },
    ],
    [fields.length, form, productCombinationStore.productCombinations, remove],
  );

  return (
    <Form {...form}>
      <form className="flex gap-4 items-start flex-col">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Supplier</FormLabel>
              <Autocomplete
                value={
                  suppliers.find((supplier) => supplier.id === field.value)
                    ?.name
                }
                options={suppliers}
                placeholder="Supplier"
                onChange={(value) => {
                  form.setValue("supplierId", Number(value.id), {
                    shouldValidate: true,
                  });
                }}
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex flex-col gap-4 items-start md:flex-row">
          <FormField
            control={form.control}
            name="receiptDate"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/4">
                <FormLabel>Receipt Date</FormLabel>
                <DatePicker {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceNo"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/4">
                <FormLabel>Reference No</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter some notes..."
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter some internal notes..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goodReceiptLines"
          render={() => (
            <FormItem className="w-full">
              <FormControl>
                <OrderItemForm
                  fields={fields}
                  form={form}
                  columns={columns}
                  name="goodReceiptLines"
                  append={() =>
                    append({
                      combinationId: null,
                      quantity: 0,
                      purchasePrice: 0,
                      discount: null,
                      discountNote: "",
                    })
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
