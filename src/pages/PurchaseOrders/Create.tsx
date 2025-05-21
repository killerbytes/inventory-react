import React, { useCallback } from "react";
import { MoveLeft, Pencil } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import services, { type ApiError } from "@/services";
import validations from "@/utils/validations";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldArrayWithId,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDebounce from "@/hooks/useDebounce";
import { ROUTES } from "@/utils/definitions";
import { useNavigate } from "react-router";
import formatCurrency from "@/utils";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import useToggle from "@/hooks/useToggle";
import ProductsModal from "./ProductsModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrderItem } from "@/services/purchaseOrder";
import { cx } from "class-variance-authority";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import SupplierModal from "./SupplierModal";
import type { Supplier } from "@/services/suppliers";
import SupplierPanel from "@/components/SupplierPanel";
import DatePicker from "@/components/DatePicker";

export default function Create() {
  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
    addItemModal: false,
  });

  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`
  )
    ? JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`
        ) as string
      )
    : {
        supplierId: -1,
        orderDate: new Date().toISOString(),
        deliveryDate: new Date().toISOString(),
      };

  const [supplier, setSupplier] = React.useState<Supplier>(
    defaultValues.supplier
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

  const { fields, append } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });

  const formData = useWatch({ control: form.control });

  const debouncedFormData = useDebounce(formData, 500);

  async function onSubmit(values: z.infer<typeof purchaseOrderSchema>) {
    try {
      const { supplier, ...rest } = values;
      await services.purchaseOrderServices.create(rest);
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`
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
            }
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
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`
        ) as string
      ) || {};
    const newDraft = { ...form.getValues(), supplier };

    if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
      localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v))
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
          {(row.getValue("product") as PurchaseOrderItem["product"]).name}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      cell: ({ row }) => (
        <div className="text-right ">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-right">Unit Price</div>,
      cell: ({ row }) => (
        <div className="text-right ">
          {formatCurrency(row.getValue("unitPrice"))}
        </div>
      ),
    },
  ];

  console.log(form.getValues());
  return (
    <div className="mb-4">
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
        className="mb-4"
      >
        <MoveLeft /> Back
      </Button>
      <h2 className="mb-4">Create Purchase Order</h2>

      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Input
                  {...field}
                  placeholder="Supplier"
                  className="w-full"
                  hidden
                />
                <div
                  className="flex gap-2 items-center group"
                  onClick={() => handleToggle({ supplierModal: true })}
                >
                  {supplier ? (
                    <SupplierPanel supplier={supplier} editable={true} />
                  ) : (
                    <Button type="button" variant="outline">
                      <Pencil size={16} className="" />
                      Select
                    </Button>
                  )}
                </div>
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

          <div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => handleToggle({ addProductsModal: true })}
                variant="outline"
              >
                <Plus />
                Add a Product
              </Button>
            </div>

            <FormField
              control={form.control}
              name="purchaseOrderItems"
              render={() => (
                <FormItem>
                  <FormControl>
                    <DataTable
                      data={fields}
                      columns={columns}
                      tableClassname={cx({
                        "border-red-500": errors.purchaseOrderItems,
                      })}
                    >
                      <TableFooter>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell colSpan={2}>Total Amount</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              fields.reduce(
                                (acc, item) =>
                                  acc + item.unitPrice * item.quantity,
                                0
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </DataTable>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      {toggle.supplierModal && (
        <SupplierModal
          isOpen={true}
          onClose={() => {
            handleToggle({ supplierModal: false });
          }}
          onSubmit={(value: Supplier) => {
            setSupplier(value);
            if (value.id !== undefined) {
              form.setValue("supplierId", value.id, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
          }}
        />
      )}
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-12">
        <Button
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
    </div>
  );
}
