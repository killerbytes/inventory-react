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
import { ProductCombinations, SalesOrderCreate, SalesOrderItem } from "@/types";
import { MODE_OF_PAYMENT_OPTIONS, UNIT_COLOR } from "@/utils/definitions";
import PriceColumn from "@/components/forms/OrderItemForm/PriceColumn";
import ProductLookupInput from "@/components/forms/ProductLookupInput";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { useCustomerStore } from "@/stores/customer.store";
import { productCombinationServices } from "@/services";
import { useProductCombinationStore } from "@/stores";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Autocomplete from "@/components/Autcomplete";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import Select from "@/components/Select";
import { Trash2 } from "lucide-react";
import React from "react";

export default function FullForm({
  form,
}: {
  form: UseFormReturn<SalesOrderCreate>;
}) {
  const { customers } = useCustomerStore();
  const { productCombinations, setProductsCombinations } =
    useProductCombinationStore();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salesOrderItems",
  });
  const modeOfPayment = form.watch("modeOfPayment");

  React.useEffect(() => {
    const getData = async () => {
      const data = await productCombinationServices.list();
      setProductsCombinations(data);
    };
    getData();
  }, [setProductsCombinations]);

  // const x = useWatch({ control: form.control, name: "salesOrderItems" });
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
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-center",
          className: "text-right min-w-[90px] w-[90px]",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`salesOrderItems.${row.index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput
                    {...field}
                    // value={Number(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
                  <>
                    <ProductLookupInput
                      items={productCombinations as ProductCombinations[]}
                      form={form}
                      {...field}
                      name="salesOrderItems"
                      onChange={(value) => {
                        field.onChange(value.id);
                        form.setValue(
                          `salesOrderItems.${row.index}.purchasePrice`,
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
                              `salesOrderItems.${row.index + 1}.quantity`,
                            );
                          }
                        }, 0);
                      }}
                      renderOptions={(items, open, setOpen, onSelect) => {
                        return (
                          open &&
                          items.map((item) => (
                            <CommandGroup key={item.id}>
                              <CommandItem
                                value={String(item.name)}
                                disabled={item.inventory.quantity < 1}
                                key={item.id}
                                onSelect={() => {
                                  setOpen(false);
                                  onSelect?.(item);
                                }}
                                className="flex items-center gap-2 justify-between"
                              >
                                {item.name}
                                <div className="flex gap-2">
                                  {item.inventory.quantity}
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
                    {/* <ProductComboSearchCommand
                      items={productCombinations}
                      onSelect={(item) => {
                        field.onChange(item.id);
                      }}
                      name="salesOrderItems"
                      form={form}
                      renderOptions={(items, open, setOpen, onSelect) => {
                        return (
                          open &&
                          items.map((item) => (
                            <CommandGroup key={item.id}>
                              <CommandItem
                                value={String(item.name)}
                                disabled={item.inventory.quantity < 1}
                                key={item.id}
                                onSelect={() => {
                                  setOpen(false);
                                  onSelect?.(item);
                                  form.setValue(
                                    `salesOrderItems.${row.index}.purchasePrice`,
                                    item.price,
                                  );

                                  setTimeout(() => {
                                    if (row.index + 1 === fields.length) {
                                      document
                                        .querySelector(".append-btn")
                                        ?.focus();
                                    } else {
                                      form.setFocus(
                                        `salesOrderItems.${row.index + 1}.quantity`,
                                      );
                                    }
                                  }, 0);
                                }}
                                className="flex items-center gap-2 justify-between"
                              >
                                {item.name}
                                <div className="flex gap-2">
                                  {item.inventory.quantity}
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
                    >
                      <Button
                        variant="outline"
                        className="w-full flex justify-between h-9 min-w-[200px]"
                        type="button"
                      >
                        {
                          productCombinations.find((i) => i.id === field.value)
                            ?.name
                        }
                        <ChevronsUpDown className="ml-auto" />
                      </Button>
                    </ProductComboSearchCommand> */}
                  </>
                );
              }}
            />
          );
        },
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
            render={() => (
              <FormItem>
                <FormControl>
                  <PriceColumn
                    index={row.index}
                    control={form.control}
                    name="salesOrderItems"
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
            name="salesOrderItems"
          />
        ),
      },
    ],
    [fields.length, form, productCombinations, remove],
  );

  const isDelivery = useWatch({ control: form.control, name: "isDelivery" });
  return (
    <>
      <Form {...form}>
        <form className="flex flex-col gap-4">
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
                  onChange={(value) => {
                    form.setValue("customerId", Number(value.id), {
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
                    form={form}
                    columns={columns}
                    name="salesOrderItems"
                    append={() =>
                      append({
                        quantity: 1,
                        purchasePrice: 0,
                        discount: 0,
                        discountNote: "",
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
                    value={String(field.value)}
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
      {/* {JSON.stringify(x)} */}
    </>
  );
}
