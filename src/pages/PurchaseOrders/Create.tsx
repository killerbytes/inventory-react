import {
  purchaseOrderServices,
  supplierServices,
  type ApiError,
  type PurchaseOrderItem,
  type Supplier,
} from "@/services";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldArrayWithId,
} from "react-hook-form";
import { GlobalContext } from "@/components/GlobalContext";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useCallback, useContext } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import EditableCell from "@/components/EditableCell";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Autocomplete from "@/components/Autcomplete";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { ROUTES } from "@/utils/definitions";
import ProductsModal from "./ProductsModal";
import { useNavigate } from "react-router";
import useToggle from "@/hooks/useToggle";
import { MoveLeft } from "lucide-react";
import { Plus } from "lucide-react";
import validations from "@/schemas";
import { addWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Table from "./Table";
import * as z from "zod";

export default function Create() {
  const { store, fetchData } = useContext(GlobalContext) || {};
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);

  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
    addItemModal: false,
  });

  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
  )
    ? JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        ) as string,
      )
    : {
        supplierId: -1,
        orderDate: new Date().toISOString(),
        deliveryDate: new Date().toISOString(),
        dueDate: addWeeks(new Date(), 1).toISOString(),
        isCheckPayment: true,
      };

  const [supplier, setSupplier] = React.useState<Supplier>(
    defaultValues.supplier,
  );
  const { purchaseOrderSchema } = validations;

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues,
  });

  const {
    control,
    formState: { errors },
  } = form;

  const isCheckPayment = form.watch("isCheckPayment");

  const { fields, append, update } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });

  const formData = useWatch({ control: form.control });

  const debouncedFormData = useDebounce(formData, 500);

  React.useEffect(() => {
    if (fetchData) {
      fetchData("suppliers", async () => {
        const { data } = await supplierServices.list();
        setSuppliers(data);
        return data;
      });
    }
  }, [fetchData]);

  React.useEffect(() => {
    if (store?.suppliers) {
      setSuppliers(store.suppliers as Supplier[]);
    }
  }, [store?.suppliers]);

  async function onSubmit(values: z.infer<typeof purchaseOrderSchema>) {
    try {
      const { supplier, ...rest } = values;
      await purchaseOrderServices.create(rest);
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
      );
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(
            err.field as keyof z.infer<typeof purchaseOrderSchema>,
            {
              type: "server",
              message: err.message,
            },
          );
        }
      });
      if (errors.length === 1) {
        toast.error(errors[0].message);
      } else {
        toast.error("Submission failed");
      }
    }
  }

  const saveDraft = useCallback(() => {
    const draft =
      JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        ) as string,
      ) || {};
    const newDraft = { ...form.getValues(), supplier };

    if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
      localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v)),
      );
    }
  }, [form, supplier]);

  React.useEffect(() => {
    saveDraft();
  }, [debouncedFormData, supplier, saveDraft]);

  const columns: ColumnDef<FieldArrayWithId<PurchaseOrderItem>>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">
          {(row.getValue("product") as { name: string })?.name}
        </div>
      ),
    },
    {
      header: () => <div className="text-right">Quantity</div>,
      accessorKey: "quantity",
      id: "quantity",
      size: 10,
      meta: {
        className: "text-right",
      },
    },
    {
      header: () => <div className="text-right">Unit Price</div>,
      accessorKey: "unitPrice",
      id: "unitPrice",

      meta: {
        className: "text-right",
        type: "currency",
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
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
          className="mb-4"
        >
          <MoveLeft /> Back
        </Button>
      </div>
      <h2 className="mb-4">Create Purchase Order</h2>

      <Form {...form}>
        <div className="flex gap-4 justify-between mb-4">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Supplier</FormLabel>
                <Input
                  {...field}
                  placeholder="Supplier"
                  className="w-full"
                  hidden
                />
                <Autocomplete
                  value={supplier}
                  items={suppliers}
                  placeholder="Supplier"
                  onChange={(value) => {
                    form.setValue("supplierId", value.id);
                    setSupplier(value);
                  }}
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
              <FormItem className="w-full">
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
              <FormItem className="w-full">
                <FormLabel>Delivery Date</FormLabel>
                <DatePicker field={field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mb-10">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-8 mb-4">
            <Button
              type="button"
              onClick={() => handleToggle({ addProductsModal: true })}
              variant="default"
            >
              <Plus />
              Add a Product
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
                    form={form}
                    errors={errors}
                  />
                </FormControl>
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
        <div className="mt-auto mb-4 align-bottom flex">
          <div>
            <FormField
              control={form.control}
              name="isCheckPayment"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row gap-2 mb-2">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                          form.setValue("isCheckPayment", checked === true);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Check payment
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
            <Label
              className={cx(
                {
                  "bg-accent/50": !isCheckPayment,
                  "bg-blue-50": isCheckPayment,
                },
                "hover:bg-accent/50 flex items-start flex-col rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950",
              )}
            >
              <div
                className={cn(
                  "grid gap-1.5 font-normal",
                  !isCheckPayment && "opacity-50",
                )}
              >
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <DatePicker field={field} disabled={!isCheckPayment} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Label>
          </div>

          <Button
            className="mt-auto ml-auto"
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
      </Form>
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
