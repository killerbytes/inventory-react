import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductCombinations, PurchaseOrderCreate, Supplier } from "@/types";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { MODE_OF_PAYMENT_OPTIONS, UNIT_COLOR } from "@/utils/definitions";
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
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { PurchaseOrderItem } from "@/types";
import Select from "@/components/Select";
import { Trash2 } from "lucide-react";
import React from "react";

export default function PendingOrderForm({
  form,
}: {
  form: UseFormReturn<PurchaseOrderCreate>;
}) {
  const { suppliers, setSuppliers } = useSupplierStore();
  const productCombinationStore = useProductCombinationStore();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "purchaseOrderItems",
    keyName: "fieldId",
  });

  const modeOfPayment = form.watch("modeOfPayment");
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
      if (!productCombinationStore.loaded) {
        const data = await productCombinationServices.list();
        productCombinationStore.setProductsCombinations(data);
      }
    };
    getData();
  }, [productCombinationStore]);

  const columns = React.useMemo<ColumnDef<PurchaseOrderItem>[]>(
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
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right w-20",
        },
        cell: ({ row }) => (
          <Controller
            name={`purchaseOrderItems.${row.index}.quantity`}
            control={form.control}
            render={({ field }) => <NumberInput {...field} />}
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
              name="purchaseOrderItems"
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
              name={`purchaseOrderItems.${row.index}.combinationId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ProductLookupInput
                      ariaInvalid={Boolean(
                        form.formState.errors?.purchaseOrderItems?.[row.index]
                          ?.combinationId,
                      )}
                      items={
                        productCombinationStore.productCombinations as ProductCombinations[]
                      }
                      form={form}
                      {...field}
                      name="purchaseOrderItems"
                      onChange={(value) => {
                        field.onChange(value.id);
                        form.setValue(
                          `purchaseOrderItems.${row.index}.purchasePrice`,
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
                              `purchaseOrderItems.${row.index + 1}.quantity`,
                            );
                          }
                        }, 0);
                      }}
                      renderOptions={(
                        items,
                        open,
                        setOpen,
                        onSelect,
                        search,
                      ) => {
                        return (
                          open &&
                          items
                            .map((item) => ({
                              item,
                              score: getScore(item.name, search), // 🔥 use score
                            }))
                            .filter(({ score }) => score > 0)
                            .sort((a, b) => b.score - a.score) // 🔥 sort by score
                            .map(({ item }) => (
                              <CommandGroup key={item.id}>
                                <CommandItem
                                  value={String(item.name)}
                                  key={item.id}
                                  onSelect={() => {
                                    setOpen(false);
                                    onSelect?.(item);
                                  }}
                                  className="flex items-center gap-2 justify-between"
                                >
                                  {item.name}
                                  <div className="flex gap-2">
                                    <span>{formatCurrency(item.price)}</span>
                                    <ColorBadge colorMap={UNIT_COLOR}>
                                      {item.unit}
                                    </ColorBadge>
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
            name={`purchaseOrderItems.${row.index}.discount`}
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
            name={`purchaseOrderItems.${row.index}.discountNote`}
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
            name={`purchaseOrderItems.${row.index}.purchasePrice`}
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
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right w-20",
        },

        cell: ({ row }) => (
          <AmountColumn
            index={row.index}
            control={form.control}
            name="purchaseOrderItems"
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
            name="deliveryDate"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/4">
                <FormLabel>Delivery Date</FormLabel>
                <DatePicker {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modeOfPayment"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/4">
                <FormLabel>Mode of Payment</FormLabel>
                <Select {...field} options={MODE_OF_PAYMENT_OPTIONS} />

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkNumber"
            render={({ field }) => {
              return (
                <FormItem
                  className={cx(
                    "w-full md:w-1/4",
                    modeOfPayment !== "CHECK" && "opacity-50",
                  )}
                >
                  <FormLabel>Check Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={modeOfPayment !== "CHECK"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem
                className={cx(
                  "w-full md:w-1/4",
                  modeOfPayment !== "CHECK" && "opacity-50",
                )}
              >
                <FormLabel>Due Date</FormLabel>
                <DatePicker {...field} disabled={modeOfPayment !== "CHECK"} />
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
          name="notes"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
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

        {/* <PendingOrderForm form={form} /> */}
        <FormField
          control={form.control}
          name="purchaseOrderItems"
          render={() => (
            <FormItem className="w-full">
              <FormControl>
                <OrderItemForm
                  fields={fields}
                  form={form}
                  columns={columns}
                  name="purchaseOrderItems"
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
