import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CategorizedProductList, PurchaseOrderCreate, Supplier } from "@/types";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { MODE_OF_PAYMENT_OPTIONS, UNIT_COLOR } from "@/utils/definitions";
import AmountColumn from "@/components/forms/OrderItemForm/AmountColumn";
import UnitColumn from "@/components/forms/OrderItemForm/UnitColumn";
import { productServices, supplierServices } from "@/services";
import OrderItemForm from "@/components/forms/OrderItemForm";
import { useProductStore, useSupplierStore } from "@/stores";
import ProductCommand from "@/components/ProductCommand";
import { CommandItem } from "@/components/ui/command";
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
  const { products, setProducts, flatProducts } = useProductStore();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "purchaseOrderItems",
    keyName: "fieldId",
  });

  const modeOfPayment = form.watch("modeOfPayment");

  React.useEffect(() => {
    const getData = async () => {
      const data: CategorizedProductList[] = await productServices.list();
      setProducts(data);
    };
    getData();
  }, []);

  React.useEffect(() => {
    const getData = async () => {
      const data: Supplier[] = await supplierServices.list();
      setSuppliers(data);
    };
    if (suppliers.length === 0) {
      getData();
    }
  }, [setSuppliers, suppliers.length]);

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
          >
            <Trash2 />
          </Button>
        ),
      },
      {
        accessorKey: "combinationId",
        header: "Product",
        meta: {
          className: "w-100",
        },
        cell: ({ row }) => {
          return (
            <Controller
              name={`purchaseOrderItems.${row.index}.combinationId`}
              control={form.control}
              render={({ field }) => {
                console.log(field.value);
                return (
                  <ProductCommand
                    {...field}
                    control={form.control}
                    list={products}
                    value={String(field.value)}
                    field="purchaseOrderItems"
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    renderOption={(combination, onChange) => {
                      return (
                        <CommandItem
                          keywords={[String(combination?.name)]}
                          value={String(combination.id)}
                          key={combination.id}
                          onSelect={onChange}
                          className="flex gap-2 items-center justify-between"
                        >
                          {combination?.name}

                          <ColorBadge className="ml-auto" colorMap={UNIT_COLOR}>
                            {String(combination.product?.unit)}
                          </ColorBadge>
                        </CommandItem>
                      );
                    }}
                  />
                );
              }}
            />
          );
        },
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
                    value={Number(field.value)}
                    type="currency"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          className: "text-right min-w-[90px] w-[90px]",
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
            render={({ field }) => <Input {...field} />}
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
    [flatProducts, form, products, remove],
  );

  return (
    <Form {...form}>
      <form>
        <div className="flex gap-4 items-start ">
          <FormField
            control={form.control}
            name="purchaseOrderNumber"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>PO #</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Delivery Date</FormLabel>
                <DatePicker {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Supplier</FormLabel>
              <Autocomplete
                value={
                  suppliers.find((supplier) => supplier.id === field.value)
                    ?.name
                }
                options={suppliers}
                placeholder="Supplier"
                onChange={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  form.setValue("supplierId", parseInt(value), {
                    shouldValidate: true,
                  });
                }}
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-start">
          <FormField
            control={form.control}
            name="modeOfPayment"
            render={({ field }) => (
              <FormItem className="mb-4 w-50">
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
                    "mb-4",
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
                  "mb-4",
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
            <FormItem className="mb-4">
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
            <FormItem className="mb-4">
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
            <FormItem className="w-full mb-4">
              <FormControl>
                <OrderItemForm
                  fields={fields}
                  control={form.control}
                  columns={columns}
                  name="purchaseOrderItems"
                  errors={form.formState.errors}
                  append={() =>
                    append({
                      combinationId: null,
                      quantity: 1,
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
