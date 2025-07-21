import {
  productServices,
  PurchaseOrder,
  PurchaseOrderItem,
  supplierServices,
} from "@/services";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FieldArrayWithId,
  useFieldArray,
  UseFormReturn,
} from "react-hook-form";
import { MODE_OF_PAYMENT_OPTIONS, UNIT_OPTIONS } from "@/utils/definitions";
import { useProductStore, useSupplierStore } from "@/stores";
import EditableCell from "@/components/EditableCell";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import { formatCurrency } from "@/utils/formatters";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import ProductsModal from "./ProductsModal";
import { Plus, Trash2 } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import Table from "./Table";
import React from "react";

export default function PurchaseOrderForm({
  form,
}: {
  form: UseFormReturn<PurchaseOrder>;
}) {
  const { suppliers, setSuppliers } = useSupplierStore();
  const { products, setProducts } = useProductStore();
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
    addItemModal: false,
  });

  const {
    control,
    formState: { errors },
  } = form;

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "purchaseOrderItems",
    keyName: "fieldId",
  });

  const modeOfPayment = form.watch("modeOfPayment");

  const exclude = fields.map((item) => item.productId);
  const items = exclude
    ? products.filter((p) => !exclude?.includes(p.id))
    : products;

  React.useEffect(() => {
    const getData = async () => {
      const { data } = await productServices.list();

      setProducts(data);
    };

    getData();
  }, []);

  React.useEffect(() => {
    const getData = async () => {
      const { data } = await supplierServices.list();
      setSuppliers(data);
    };
    if (suppliers.length === 0) {
      getData();
    }
  }, []);

  const removeSelected = (value) => {
    remove(value.index);
  };

  const columns: ColumnDef<FieldArrayWithId<PurchaseOrderItem>>[] = [
    {
      id: "select",
      size: 1,
      cell: ({ row }) => (
        <Button onClick={() => removeSelected(row)} variant="outline">
          <Trash2 />
        </Button>
      ),
    },
    {
      accessorKey: "product",
      header: "Product",
      meta: {
        className: "w-2/8",
      },
      cell: ({ row }) => (
        <Autocomplete
          value={row.getValue("product")}
          items={items}
          placeholder="Product"
          onChange={(value) => {
            // meta.updateData(row.index, "product", value);
            console.log(row.original, value);
            update(row.index, {
              ...row.original,
              productId: value.id,
              product: value,
            });
            // meta.updateData(row.index, "productId", value.id);
          }}
        />
      ),
    },
    {
      header: () => <div className="text-right">Quantity</div>,
      accessorKey: "quantity",
      id: "quantity",
      meta: {
        className: "text-right w-1/8",
      },
    },
    {
      header: "Unit",
      accessorKey: "unit",
      id: "unit",
      size: 1000,
      meta: {
        className: "text-right w-1/8",
      },
      cell: ({ row }) => (
        <div className="font-medium">
          <Select
            value={row.getValue("unit")}
            onChange={(value) => {
              meta.updateData(row.index, "unit", value);
            }}
            options={UNIT_OPTIONS}
          />
        </div>
      ),
    },
    {
      header: () => <div className="text-right">Unit Price</div>,
      accessorKey: "unitPrice",
      id: "unitPrice",
      size: 10,
      meta: {
        className: "text-right",
        type: "currency",
      },
    },
    {
      header: () => <div className="text-right">Discount</div>,
      accessorKey: "discount",
      id: "discount",

      meta: {
        className: "text-right",
        type: "currency",
      },
    },
    {
      header: "Note",
      accessorKey: "discountNote",
      id: "discountNote",
    },
    {
      header: () => <div className="text-right">Amount</div>,
      accessorKey: "amount",
      id: "amount",
      cell: ({ row }) => {
        return formatCurrency(
          (
            row.getValue("quantity") * row.getValue("unitPrice") -
            row.getValue("discount")
          ).toFixed(2),
        );
      },
    },
  ];

  const defaultColumn = {
    cell: EditableCell,
  };

  const meta = {
    updateData: (rowIndex: number, columnId: string, value: string) => {
      // Ensure purchaseOrderItems exists and required fields are present
      // const items = formData.purchaseOrderItems ?? [];
      const items = fields;
      const currentItem = items[rowIndex] ?? {};
      // Fallbacks for required fields
      const updatedItem = {
        ...currentItem,
        [columnId]: value,
      };

      if (currentItem) {
        update(rowIndex, updatedItem);
      }
    },
  };

  return (
    <>
      <div className="flex gap-4 items-start ">
        <FormField
          control={form.control}
          name="purchaseOrderNumber"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>PO #</FormLabel>
              <Input {...field} value={field.value ?? ""} />
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
              value={suppliers.find((supplier) => supplier.id === field.value)}
              items={suppliers}
              placeholder="Supplier"
              onChange={(value) => {
                if (value && value.id !== undefined) {
                  form.setValue("supplierId", value.id, {
                    shouldValidate: true,
                  });
                }
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
            <FormItem className="mb-4">
              <FormLabel>Mode of Payment</FormLabel>
              <Select
                {...field}
                options={MODE_OF_PAYMENT_OPTIONS}
                // value={field.value.value}
              />

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
            <FormItem className="mb-4">
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
          <Button type="button" onClick={() => append({})} variant="default">
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
                  data={fields}
                  columns={columns}
                  defaultColumn={defaultColumn}
                  meta={meta}
                  errors={errors}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* <div className="mt-auto mb-4 align-bottom flex">
        <Button className="mt-auto ml-auto" type="button">
          {isCreate ? "Create Order" : "Receive Order"}
        </Button>

        <div className="flex items-center">
          <Button
            variant="outline"
            className={"rounded-r-none"}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log(form.getValues(), form.formState.errors);
              form
                .handleSubmit(onSubmit)(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
          >
            Receive Order
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={"rounded-l-none border-l-0 px-2"}
              >
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Save />
                Save
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div> */}

      {toggle.addProductsModal && (
        <ProductsModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addProductsModal: false });
          }}
          onAdd={(item: PurchaseOrderItem) => {
            append(item);
          }}
          exclude={fields.map((item) => item.productId)}
        />
      )}
    </>
  );
}
