import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  salesOrderServices,
  type SalesOrder,
  type SalesOrderItem,
} from "@/services";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
// import useDebounce from "@/hooks/useDebounce";
import { MoveLeft, Plus } from "lucide-react";
import { ROUTES } from "@/utils/definitions";
import ProductsModal from "./ProductsModal";
import { useNavigate } from "react-router";
import useToggle from "@/hooks/useToggle";
import validations from "@/schemas";
import { toast } from "sonner";
import React from "react";

export default function Create() {
  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addProductsModal: false,
  });
  const { salesOrderSchema } = validations;

  const form = useForm<SalesOrder>({
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

  const { fields, append, update } = useFieldArray({
    control,
    name: "salesOrderItems",
  });

  const formData = useWatch({ control: form.control });

  // const debouncedFormData = useDebounce(formData, 500);

  async function onSubmit(values: SalesOrder) {
    try {
      await salesOrderServices.create(values);
      toast.success(`Sales Order created successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error) {
      toast.error(`Submission failed, ${error.response.data.message}`);
    }
  }

  // const saveDraft = React.useCallback(() => {
  //   const draft =
  //     JSON.parse(
  //       localStorage.getItem(
  //         `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
  //       ) as string,
  //     ) || {};
  //   const newDraft = { ...form.getValues(), supplier, items };

  //   if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
  //     console.log("saving...", draft, newDraft);
  //     localStorage.setItem(
  //       `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
  //       JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v)),
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
      header: () => <div className="text-right">Quantity</div>,
      accessorKey: "quantity",
      accessorFn: (row) => row.quantity,
      id: "quantity",
      size: 10,
      meta: {
        className: "text-right",
      },
    },
    {
      header: () => <div className="text-right">Unit Price</div>,
      accessorKey: "unitPrice",
      accessorFn: (row) => row.unitPrice,
      id: "unitPrice",

      meta: {
        className: "text-right",
        type: "currency",
      },
    },

    // {
    //   accessorKey: "quantity",
    //   header: () => <div className="text-right">Quantity</div>,
    //   cell: ({ row }) => (
    //     <div className="text-right ">{row.getValue("quantity")}</div>
    //   ),
    // },
    // {
    //   accessorKey: "discount",
    //   header: () => <div className="text-right">Discount</div>,
    //   cell: ({ row }) => (
    //     <div className="text-right ">{row.getValue("discount")}</div>
    //   ),
    // },

    // {
    //   accessorKey: "unitPrice",
    //   header: () => <div className="text-right">Unit Price</div>,
    //   cell: ({ row }) => (
    //     <div className="text-right ">
    //       {formatCurrency(row.getValue("unitPrice"))}
    //     </div>
    //   ),
    // },
  ];

  function EditableCell({
    getValue,
    cell,
    row: { index },
    column: { id },
    table,
  }) {
    const initialValue = getValue();
    const type = cell.column.columnDef.meta?.type;
    const [value, setValue] = React.useState(initialValue);

    const onUpdate = () => {
      table.options.meta?.updateData(index, id, value);
    };

    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <NumberInput
        value={value}
        type={type}
        onUpdate={onUpdate}
        onChange={(e) => {
          setValue(e.value);
        }}
      />
    );
  }

  const defaultColumn = {
    cell: EditableCell,
  };

  const meta = {
    updateData: (rowIndex, columnId, value) => {
      // Skip page index reset until after next rerender
      update(rowIndex, {
        ...formData.salesOrderItems[rowIndex],
        [columnId]: value,
      });
    },
  };

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
                    <DataTable
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
                    ></DataTable>
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
