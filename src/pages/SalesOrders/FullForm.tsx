import PurchaseOrderItemForm, {
  AmountColumn,
  UnitColumn,
} from "../PurchaseOrders/Form/PurchaseOrderItemForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Controller, useFieldArray } from "react-hook-form";
import { useCustomerStore } from "@/stores/customer.store";
import ProductCommand from "@/components/ProductCommand";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import NumberInput from "@/components/NumberInput";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores";
import { SalesOrderItem } from "@/types";
import { Trash2 } from "lucide-react";
import React from "react";

export default function FullForm({ form }) {
  const { customers, setCustomers } = useCustomerStore();
  const { products, setProducts, flatProducts } = useProductStore();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salesOrderItems",
  });

  const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
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
              name={`salesOrderItems.${row.index}.combinationId`}
              control={form.control}
              render={({ field }) => {
                return (
                  <ProductCommand
                    {...field}
                    control={form.control}
                    list={products}
                    value={String(field.value)}
                    field="salesOrderItems"
                    onChange={(value) => {
                      field.onChange(value);
                      const selected = flatProducts.find(
                        (item) => item.combinationId === Number(value),
                      );
                      if (selected) {
                        form.setValue(
                          `salesOrderItems.${row.index}.purchasePrice`,
                          selected.price,
                        );
                      }
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
            name={`salesOrderItems.${row.index}.purchasePrice`}
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
            name={`salesOrderItems.${row.index}.quantity`}
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
          return <UnitColumn index={row.index} form={form} />;
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
            name={`salesOrderItems.${row.index}.discount`}
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
            name={`salesOrderItems.${row.index}.discountNote`}
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
            name="salesOrderItems"
          />
        ),
      },
    ],
    [flatProducts, form, products, remove],
  );

  return (
    <>
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="salesOrderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Order Number</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Customer</FormLabel>
                <Autocomplete
                  value={
                    customers.find((customer) => customer.id === field.value)
                      ?.name
                  }
                  options={customers}
                  placeholder="Customer"
                  onChange={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    form.setValue("customerId", parseInt(value), {
                      shouldValidate: true,
                    });
                  }}
                />

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Order Date</FormLabel>
                  <DatePicker field={field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Delivery Date</FormLabel>
                  <DatePicker field={field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
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
          <FormField
            control={form.control}
            name="internalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter some internal notes not visible to customer..."
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
            name="salesOrderItems"
            render={({ field }) => (
              <FormItem className="w-full mb-4">
                <FormControl>
                  <PurchaseOrderItemForm
                    control={form.control}
                    fields={fields}
                    name="salesOrderItems"
                    columns={columns}
                    errors={form.formState.errors}
                    append={() =>
                      append({
                        quantity: 1,
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
    </>
  );
}
