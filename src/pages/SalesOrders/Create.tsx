import React from "react";
import { MoveLeft } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services, { type ApiError } from "@/services";
import validations from "@/utils/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/utils/definitions";
import { useNavigate } from "react-router";
import ProductsTable from "./ProductsTable";
import SalesOrderForm from "./SalesOrderForm";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrderItem } from "@/services/purchaseOrder";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import formatCurrency from "@/utils";
import type { SalesOrderItem } from "@/services/salesOrder";
import type { Supplier } from "@/services/suppliers";

export default function Create() {
  const navigate = useNavigate();

  const [items, setItems] = React.useState<SalesOrderItem[]>([]);
  const [supplier, setSupplier] = React.useState<Supplier | null>(null);
  const { salesOrderSchema } = validations;

  const form = useForm<z.infer<typeof salesOrderSchema>>({
    resolver: zodResolver(salesOrderSchema),

    defaultValues: {
      customer: "Azid",
      orderDate: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),
    },
  });

  async function onSubmit(values: z.infer<typeof salesOrderSchema>) {
    try {
      await services.salesOrderServices.create({
        ...values,
        salesOrderItems: items,
      });
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
  const columns: ColumnDef<PurchaseOrderItem>[] = [
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
      <div className="mb-12">
        <SalesOrderForm
          form={form}
          supplier={supplier}
          onSupplierChange={setSupplier}
        />
      </div>

      <ProductsTable
        items={items}
        setItems={setItems}
        columns={columns}
        footer={
          <TableFooter>
            <TableRow>
              <TableCell></TableCell>
              <TableCell colSpan={3}>Total Amount</TableCell>
              <TableCell className="text-right">
                {formatCurrency(
                  items.reduce(
                    (acc, item) => acc + item.unitPrice * item.quantity,
                    0
                  )
                )}
              </TableCell>
            </TableRow>
          </TableFooter>
        }
      />
      <DialogFooter>
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
      </DialogFooter>
    </div>
  );
}
