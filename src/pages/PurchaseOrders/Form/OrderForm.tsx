import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CategorizedProductList,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
} from "@/types";
import { MODE_OF_PAYMENT_OPTIONS, UNIT_OPTIONS } from "@/utils/definitions";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import ProductCommand from "../../../components/ProductCommand";
import { productServices, supplierServices } from "@/services";
import { useProductStore, useSupplierStore } from "@/stores";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import NumberInput from "@/components/NumberInput";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Amount, Table, Unit } from "../Table";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import Select from "@/components/Select";
import React, { useMemo } from "react";

export default function PurchaseOrderForm({
  form,
}: {
  form: UseFormReturn<PurchaseOrder>;
}) {
  const { suppliers, setSuppliers } = useSupplierStore();
  const { products, flatProducts, setProducts } = useProductStore();

  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseOrderItems",
    keyName: "fieldId",
  });

  const modeOfPayment = form.watch("modeOfPayment");

  React.useEffect(() => {
    const getData = async () => {
      const data: CategorizedProductList[] = await productServices.list();
      const combined = data.map((item) => {
        const products = item.products.flatMap((product) => {
          const { subProducts, ...rest } = product;
          return [rest, ...(subProducts || [])];
        });

        return {
          ...item,
          products,
        };
      });

      setProducts(combined);
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
  }, []);

  const removeSelected = (value: Row<PurchaseOrderItem>) => {
    remove(value.index);
  };

  const columns = useMemo<ColumnDef<PurchaseOrderItem>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button onClick={() => removeSelected(row)} variant="outline">
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
              control={control}
              render={({ field }) => (
                <ProductCommand
                  control={control}
                  list={products}
                  index={row.index}
                  setValue={setValue}
                  {...field}
                  value={String(field.value)}
                />
              )}
            />
          );
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        meta: {
          className: "text-right w-32",
        },
        cell: ({ row }) => (
          <Controller
            name={`purchaseOrderItems.${row.index}.unitPrice`}
            control={control}
            render={({ field }) => {
              const error = errors?.purchaseOrderItems?.[row.index]?.unitPrice;
              return (
                <NumberInput
                  {...field}
                  type="currency"
                  aria-invalid={error ? "true" : "false"}
                />
              );
            }}
          />
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          className: "text-right w-10",
        },
        cell: ({ row }) => (
          <Controller
            name={`purchaseOrderItems.${row.index}.quantity`}
            control={control}
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
          const product = flatProducts.find(
            (i) => i.combinationId === Number(row.original.combinationId),
          );
          return product && <Badge>{product?.unit}</Badge>;
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
            control={control}
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
          <Input
            {...register(`purchaseOrderItems.${row.index}.discountNote`)}
            className="border px-2"
          />
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right w-20",
        },

        cell: ({ row }) => <Amount index={row.index} control={control} />,
      },
    ],
    [register, products, errors],
  );

  return (
    <>
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
          name="orderDate"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Order Date</FormLabel>
              <DatePicker {...field} />
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
                suppliers.find((supplier) => supplier.id === field.value)?.name
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
              className={cx("mb-4", modeOfPayment !== "CHECK" && "opacity-50")}
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

      <div className="mb-10">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-8 mb-4">
          <Button
            type="button"
            onClick={() =>
              append({
                productId: null,
                quantity: 1,
                unit: "",
                unitPrice: 0,
                discount: null,
                discountNote: "",
              })
            }
            variant="default"
          >
            <Plus />
            Append
          </Button>
        </div>
        <FormField
          control={form.control}
          name="purchaseOrderItems"
          render={() => (
            <FormItem className="w-full">
              <FormControl>
                <Table
                  control={form.control}
                  data={fields}
                  columns={columns}
                  errors={errors}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
