import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  purchaseOrderServices,
  type PurchaseOrder,
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
import { formatCurrency, formatDate, getStatus } from "@/utils/formatters";
import { FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { CircleCheckBig, MoveLeft, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ORDER_STATUS, ROUTES } from "@/utils/definitions";
import SupplierPanel from "@/components/SupplierPanel";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import EditableCell from "@/components/EditableCell";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import Tooltip from "@/components/Tooltip";
import React, { useCallback } from "react";
import CancelForm from "./CancelForm";
import { AxiosError } from "axios";
import { toast } from "sonner";
import Table from "./Table";
import { z } from "zod";

export default function Create() {
  const [data, setData] = React.useState<PurchaseOrder | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const nextStatus = getStatus(data?.status, true);

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    // defaultValues,
  });
  const {
    reset,
    setValue,
    control,
    formState: { errors },
  } = form;

  const { fields, append, update } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });

  async function onSubmit(values) {
    try {
      console.log(values);
      await purchaseOrderServices.updateStatus(parseInt(id as string), {
        status: nextStatus.key,
      } as PurchaseOrder);
      toast.success(`Purchase Order created successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  async function onCancelOrder(form) {
    try {
      console.log(form);
      await purchaseOrderServices.updateStatus(parseInt(id as string), {
        ...form,
        status: ORDER_STATUS.CANCELLED.key,
      });

      toast.success(`Purchase Order canceled successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
      }
      if (error.response.data.code === "VALIDATION") {
        throw error;
      } else {
        toast.error(`Submission failed, ${error.response.data.error.message}`);
      }
    }
  }

  async function onDeleleOrder() {
    try {
      await purchaseOrderServices.delete(id);
      toast.success(`Purchase Order deleted successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  const getData = useCallback(async () => {
    try {
      const response = await purchaseOrderServices.get(id);
      const data = response.data;
      setData(data);
      // setValue("purchaseOrderItems", data.purchaseOrderItems);
      reset(data);
    } catch (error) {
      navigate(ROUTES.PURCHASE_ORDERS);
      toast.error("Submission failed - " + error?.response.data.error.message);
    }
  }, [id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  // const columns: ColumnDef<PurchaseOrderItem>[] = [
  //   {
  //     accessorKey: "product.name",
  //     header: "Product",
  //   },
  //   {
  //     accessorKey: "quantity",
  //     header: () => <div className="text-right">Quantity</div>,
  //     meta: {
  //       className: "text-right",
  //     },
  //   },
  //   {
  //     accessorKey: "unitPrice",
  //     header: () => <div className="text-right">Unit Price</div>,
  //     meta: {
  //       className: "text-right",
  //       type: "currency",
  //     },
  //   },
  // ];

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
        >
          <MoveLeft /> Back
        </Button>
      </div>
      <Form {...form}>
        <div className="mb-4 md:flex md:justify-between items-center">
          <h1 className="my-4">Purchase Order #{id}</h1>
          <div className="flex gap-2">
            {data?.isCheckPayment && (
              <>
                <Badge
                  className={cx("relative titlecase", `status-check-payment`)}
                >
                  Check Payment
                </Badge>

                {data?.isCheckPaymentPaid && (
                  <Badge className="text-white bg-green-700">
                    <CircleCheckBig size="1.5rem" /> Paid
                  </Badge>
                )}
              </>
            )}
            {data?.status && (
              <Badge
                className={cx(
                  "capitalize",
                  `status-${data?.status.toLowerCase()}`,
                )}
              >
                {getStatus(data?.status).label}
              </Badge>
            )}
          </div>
        </div>
        <div className="md:flex md:justify-between">
          <div className="mb-4">
            <SupplierPanel supplier={data?.supplier as Supplier} />
          </div>
          <div className="mb-4">
            <div>
              {data?.isCheckPayment && (
                <div className="flex">
                  <div className="font-medium w-[150px]">Due Date</div>
                  <span
                    className={cx({
                      "text-red-500 font-semibold": !data?.isCheckPaymentPaid,
                    })}
                  >
                    {data?.dueDate ? formatDate(data.dueDate) : "-"}
                  </span>
                </div>
              )}

              <div className="flex">
                <div className="font-medium w-[150px]">Delivery Date</div>
                {data?.deliveryDate ? formatDate(data.deliveryDate) : "-"}
              </div>
            </div>
          </div>
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

        {/* <DataTable
          data={data?.purchaseOrderItems || []}
          columns={columns}
          footer={
            <>
              <TableRow>
                <TableCell colSpan={2}>Total Amount</TableCell>
                <TableCell className="text-right">
                  {data?.purchaseOrderItems &&
                    formatCurrency(
                      data?.purchaseOrderItems.reduce(
                        (acc, item) => acc + item.unitPrice * item.quantity,
                        0,
                      ),
                    )}
                </TableCell>
              </TableRow>
            </>
          }
        /> */}
        <div className="mt-auto">
          <div className="mb-4">
            <div className="mb-4">
              <div className="flex gap-4">
                <div className="font-medium w-[150px]">Order Date</div>
                <Tooltip content={data?.orderByUser?.name}>
                  <div>
                    {data?.orderDate ? formatDate(data.orderDate) : "-"}
                  </div>
                </Tooltip>
              </div>
              <div className="flex gap-4">
                <div className="font-medium w-[150px]">Received Date</div>
                {data?.receivedDate ? (
                  <Tooltip content={data?.receivedByUser?.name}>
                    {formatDate(data.receivedDate)}
                  </Tooltip>
                ) : (
                  "-"
                )}
              </div>
              <div className="flex gap-4">
                <div className="font-medium w-[150px]">Completed Date</div>
                {data?.completedDate ? (
                  <Tooltip content={data?.completedByUser?.name}>
                    {formatDate(data.completedDate)}
                  </Tooltip>
                ) : (
                  "-"
                )}
              </div>
              <div className="flex gap-4">
                <div className="font-medium w-[150px]">Cancelled Date</div>
                {data?.cancelledDate ? (
                  <Tooltip content={data?.cancelledByUser?.name}>
                    {formatDate(data.cancelledDate)}
                  </Tooltip>
                ) : (
                  "-"
                )}
              </div>
            </div>
            {data?.status === ORDER_STATUS.CANCELLED.key && (
              <div className="mb-4">
                Cancellation Reason:
                <p>{data?.cancellationReason}</p>
              </div>
            )}
            <div className="mb-8">
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
              Notes:
              <p>{data?.notes}</p>
            </div>
          </div>
          <div className="mt-auto flex justify-end gap-4 align-end mb-4">
            {data?.status === ORDER_STATUS.PENDING.key && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mr-auto">
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete this order?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Delete this order
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleleOrder}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="ml-auto flex items-end justify-between">
              {data?.status === ORDER_STATUS.COMPLETED.key && (
                <CancelForm onSubmit={onCancelOrder} />
              )}
              {data?.status !== ORDER_STATUS.COMPLETED.key &&
                data?.status !== ORDER_STATUS.CANCELLED.key && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="status-completed capitalize">
                        Order {nextStatus?.label}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirm <span>{nextStatus?.label}</span> order
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {nextStatus?.description}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(form.formState.errors);
                            form
                              .handleSubmit(onSubmit)(e)
                              .catch((error) => {
                                console.error("Form submission error:", error);
                              });
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
