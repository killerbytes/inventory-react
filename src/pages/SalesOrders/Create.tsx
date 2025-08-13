import {
  ApiErrorResponse,
  CategorizedItemList,
  CategorizedProductList,
  Inventory,
  SalesOrder,
  SalesOrderItem,
} from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AmountColumn,
  UnitColumn,
} from "../PurchaseOrders/Form/PurchaseOrderItemForm";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { inventoryServices, salesOrderServices } from "@/services";
import { TableCell, TableRow } from "@/components/ui/table";
import ProductCommand from "@/components/ProductCommand";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommandItem } from "@/components/ui/command";
import { MoveLeft, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/definitions";
import { salesOrderSchema } from "@/schemas";
import ProductsModal from "./ProductsModal";
import { useNavigate } from "react-router";
import { useProductStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import ProductList from "./ProductList";
import { toast } from "sonner";
import React from "react";

export default function Create() {
  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
  });
  const { products, setProducts, flatProducts } = useProductStore();

  const form = useForm<SalesOrder>({
    resolver: zodResolver(salesOrderSchema),

    defaultValues: {
      customer: "Azid",
      orderDate: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),
      salesOrderItems: [{}],
    },
  });
  const {
    control,
    formState: { errors },
  } = form;

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "salesOrderItems",
  });

  const formData = useWatch({ control: form.control });

  async function onSubmit(values: SalesOrder) {
    try {
      await salesOrderServices.create(values);
      toast.success(`Sales Order created successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(`Submission failed, ${apiError.message}`);
    }
  }

  console.log(products);
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
              name={`purchaseOrderItems.${row.index}.combinationId`}
              control={form.control}
              render={({ field }) => (
                <ProductCommand
                  {...field}
                  control={form.control}
                  list={products}
                  index={row.index}
                  value={String(field.value)}
                  onChange={(value) => {
                    field.onChange(value);
                    const selected = flatProducts.find(
                      (item) => item.combinationId === Number(value),
                    );
                    if (selected) {
                      form.setValue(
                        `purchaseOrderItems.${row.index}.purchasePrice`,
                        selected.price,
                      );
                    }
                  }}
                  renderOption={(combination, onChange) => {
                    return (
                      <CommandItem
                        keywords={[combination.sku ?? ""]}
                        value={String(combination.id)}
                        key={combination.id}
                        onSelect={(v) => {
                          onChange(v);
                          // const selected = flatProducts.find(
                          //   (item) => item.combinationId === Number(v),
                          // );
                          // setValue(
                          //   `purchaseOrderItems.${index}.unitPrice`,
                          //   Number(selected?.price),
                          // );
                        }}
                        className="flex gap-2 items-center justify-between"
                      >
                        <div className="flex gap-2 items-center">
                          {combination.values.map((value) => {
                            return <span key={value.id}>{value.value}</span>;
                          })}
                          {combination.inventory?.quantity !== undefined &&
                            combination.inventory?.quantity > 0 && (
                              <small className="text-muted-foreground">
                                x{combination.inventory?.quantity}
                              </small>
                            )}
                        </div>
                        <span className="text-muted-foreground">
                          {formatCurrency(combination.price)}
                        </span>
                      </CommandItem>
                    );
                  }}
                />
              )}
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
          <AmountColumn index={row.index} control={form.control} />
        ),
      },
    ],
    [flatProducts, form, products, remove],
  );

  return (
    <>
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(ROUTES.SALES_ORDERS)}
          className="mb-4"
        >
          <MoveLeft /> Back
        </Button>
      </div>
      <h2 className="mb-4">Create Sales Order</h2>
      <Form {...form}>
        <form>
          <div className="mb-4">
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Input
                    {...field}
                    placeholder="Customer Name"
                    className="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4 mb-4">
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
          <div className="mb-4">
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
          </div>
          <div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mb-4">
              <Button
                onClick={() => handleToggle({ addProductsModal: true })}
                variant="outline"
                type="button"
              >
                <Plus />
                Add a Product
              </Button>
            </div>

            <FormField
              control={form.control}
              name="saleOrderItems"
              render={() => (
                <FormItem>
                  <FormControl>
                    {/* <DataTable
                      data={fields}
                      columns={columns}
                      defaultColumn={defaultColumn}
                      meta={meta}
                      tableClassname={cx({
                        "border-red-500": errors.salesOrderItems,
                      })}
                      footer={
                        <>
                          <TableRow>
                            <TableCell colSpan={3}>Total Amount</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(
                                fields.reduce(
                                  (acc, item) =>
                                    acc + item.unitPrice * item.quantity,
                                  0,
                                ),
                              )}
                            </TableCell>
                          </TableRow>
                        </>
                      }
                    ></DataTable> */}

                    <DataTable
                      data={fields}
                      columns={columns}
                      tableClassname={cx({
                        "border-red-500": errors.purchaseOrderItems,
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <div className="flex mt-auto mb-4 align-bottom">
        <Button
          className="ml-auto"
          onClick={(e) => {
            e.preventDefault();
            console.log(form.formState.errors);
            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
          type="button"
        >
          Create Order
        </Button>
      </div>

      {toggle.addProductsModal && (
        <ProductsModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addProductsModal: false });
          }}
          onAdd={(item: SalesOrderItem) => {
            append(item);
          }}
          exclude={fields.map((item) => item.inventoryId)}
        />
      )}
    </>
  );
}
