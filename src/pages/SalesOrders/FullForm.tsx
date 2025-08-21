import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrderItemForm, {
  AmountColumn,
  UnitColumn,
} from "../../components/forms/OrderItemForm";
import {
  Controller,
  useFieldArray,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { useCustomerStore } from "@/stores/customer.store";
import ProductCommand from "@/components/ProductCommand";
import { StaticInput } from "@/components/StaticInput";
import { SalesOrder, SalesOrderItem } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Autocomplete from "@/components/Autcomplete";
import NumberInput from "@/components/NumberInput";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductStore } from "@/stores";
import { Trash2 } from "lucide-react";
import React from "react";

export default function FullForm({
  form,
}: {
  form: UseFormReturn<SalesOrder>;
}) {
  const { customers } = useCustomerStore();
  const { products, flatProducts } = useProductStore();
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
          headerClassName: "text-center",
          className: "text-right",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`salesOrderItems.${row.index}.purchasePrice`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StaticInput
                    value={Number(field.value)}
                    error={
                      form.formState.errors.salesOrderItems?.[row.index]
                        ?.purchasePrice?.message
                    }
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
          headerClassName: "text-center",
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
          headerClassName: "text-center",
        },
        cell: ({ row }) => {
          return (
            <UnitColumn
              index={row.index}
              control={form.control}
              name="salesOrderItems"
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
            render={({ field }) => (
              <Input {...field} value={field.value ?? ""} />
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
            name="salesOrderItems"
          />
        ),
      },
    ],
    [flatProducts, form, products, remove],
  );

  const isDelivery = useWatch({ control: form.control, name: "isDelivery" });
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
              <FormItem>
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
                  <DatePicker {...field} value={String(field.value)} />
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
            render={() => (
              <FormItem className="w-full mb-4">
                <FormControl>
                  <OrderItemForm
                    fields={fields}
                    control={form.control}
                    columns={columns}
                    name="salesOrderItems"
                    errors={form.formState.errors}
                    append={() =>
                      append({
                        quantity: 1,
                        purchasePrice: 0,
                        discount: 0,
                        discountNote: "",
                        unit: "",
                        combinationId: null,
                      })
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDelivery"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormLabel>For Delivery</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          {isDelivery && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardAction>
                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-[200px]">
                        <FormLabel>Delivery Date</FormLabel>
                        <DatePicker {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
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
                    name="deliveryInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes</FormLabel>
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
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </>
  );
}
