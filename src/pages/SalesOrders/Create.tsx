import { MoveLeft, Plus } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import services, { type ApiError } from "@/services";
import validations from "@/utils/validations";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/utils/definitions";
import { useNavigate } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrderItem } from "@/services/purchaseOrder";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import formatCurrency from "@/utils";
import useToggle from "@/hooks/useToggle";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/DataTable";
import ProductsModal from "./ProductsModal";
import type { SalesOrderItem } from "@/services/salesOrder";
import { cx } from "class-variance-authority";

export default function Create() {
  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
    addItemModal: false,
  });
  const { salesOrderSchema } = validations;

  const form = useForm<z.infer<typeof salesOrderSchema>>({
    resolver: zodResolver(salesOrderSchema),

    defaultValues: {
      customer: "Azid",
      orderDate: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),
    },
  });
  const {
    control,
    formState: { errors },
  } = form;
  const { fields, append } = useFieldArray({
    control,
    name: "salesOrderItems",
  });

  async function onSubmit(values: z.infer<typeof salesOrderSchema>) {
    try {
      await services.salesOrderServices.create(values);
      toast.success(`Sales Order created successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (err) {
      // console.log(error.response.data.error);
      const { error } = err.response.data;

      if (error?.errors) {
        error.errors.forEach((err: ApiError) => {
          if (err.field) {
            form.setError(err.field as keyof z.infer<typeof salesOrderSchema>, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error(`Submission failed, ${error.response.data.error.message}`);
      }
    }
  }

  // const saveDraft = useCallback(() => {
  //   const draft =
  //     JSON.parse(
  //       localStorage.getItem(
  //         `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`
  //       ) as string
  //     ) || {};
  //   const newDraft = { ...form.getValues(), supplier, items };

  //   if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
  //     console.log("saving...", draft, newDraft);
  //     localStorage.setItem(
  //       `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
  //       JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v))
  //     );
  //   }
  // }, [form, items, supplier]);

  // React.useEffect(() => {
  //   saveDraft();
  // }, [debouncedFormData, items, supplier, saveDraft]);
  const columns: ColumnDef<SalesOrderItem>[] = [
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
      accessorKey: "inventory",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("inventory")?.product?.name}
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
      accessorKey: "discount",
      header: () => <div className="text-right">Discount</div>,
      cell: ({ row }) => (
        <div className="text-right ">{row.getValue("discount")}</div>
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

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(ROUTES.SALES_ORDERS)}
        className="mb-4"
      >
        <MoveLeft /> Back
      </Button>
      <h2 className="mb-4">Create Sales Order</h2>
      <Form {...form}>
        <form className="space-y-8">
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
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mb-2">
              <Button
                onClick={() => handleToggle({ addProductsModal: true })}
                variant="outline"
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
                    <DataTable
                      data={fields}
                      columns={columns}
                      tableClassname={cx({
                        "border-red-500": errors.salesOrderItems,
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
      {toggle.addProductsModal && (
        <ProductsModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addProductsModal: false });
          }}
          onAdd={(item: PurchaseOrderItem) => {
            setItems((prev) => [...prev, item]);
          }}
          exclude={items.map((item) => item.inventoryId)}
        />
      )}
    </div>
  );
}
