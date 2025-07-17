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
import { MODE_OF_PAYMENT, ORDER_STATUS, ROUTES } from "@/utils/definitions";
import { formatCurrency, formatDate, getStatus } from "@/utils/formatters";
import { FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { CircleCheckBig, MoveLeft, Trash2 } from "lucide-react";
import SupplierPanel from "@/components/SupplierPanel";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import EditableCell from "@/components/EditableCell";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import PurchaseOrderForm from "./PurchaseOrderForm";
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
    control,
    formState: { errors },
  } = form;

  const { fields, update } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });

  async function onSubmit(values: PurchaseOrder) {
    try {
      console.log(values);

      await purchaseOrderServices.updateStatus(id, {
        status: nextStatus.key,
      });
      toast.success(`Purchase Order completed`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  async function onSubmitReceivedOrder(values: PurchaseOrder) {
    try {
      console.log(values);
      await purchaseOrderServices.update(id, {
        ...values,
      });

      // await purchaseOrderServices.updateStatus(parseInt(id as string), {
      //   status: nextStatus.key,
      // } as PurchaseOrder);
      toast.success(`Purchase Order received`);
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
      accessorKey: "product.name",
      header: "Product",
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
      header: "Unit",
      accessorKey: "unit",
      id: "unit",
      size: 10,
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
      meta: {
        className: "text-right",
        type: "currency",
      },
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
        {data?.status === ORDER_STATUS.PENDING.key ? (
          <PurchaseOrderForm form={form} onSubmit={onSubmitReceivedOrder} />
        ) : (
          <>
            <div className="mb-4 md:flex md:justify-between items-center">
              <h1 className="my-4">
                Purchase Order #{data?.purchaseOrderNumber}
              </h1>
              <div className="flex gap-2">
                {data?.modeOfPayment === MODE_OF_PAYMENT.CHECK && (
                  <>
                    <Badge
                      className={cx(
                        "relative titlecase",
                        `status-check-payment`,
                      )}
                    >
                      Check Payment
                    </Badge>

                    {/* {data?.isCheckPaymentPaid && (
                    <Badge className="text-white bg-green-700">
                      <CircleCheckBig size="1.5rem" /> Paid
                    </Badge>
                  )} */}
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
                  {data?.modeOfPayment === MODE_OF_PAYMENT.CHECK && (
                    <>
                      <div className="flex">
                        <div className="font-medium w-[150px]">
                          Check Number
                        </div>
                        <span>{data?.checkNumber}</span>
                      </div>
                      <div className="flex">
                        <div className="font-medium w-[150px]">Due Date</div>
                        <span className={cx("text-red-500 font-semibold")}>
                          {data?.dueDate ? formatDate(data.dueDate) : "-"}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex">
                    <div className="font-medium w-[150px]">Delivery Date</div>
                    {data?.deliveryDate ? formatDate(data.deliveryDate) : "-"}
                  </div>
                </div>
              </div>
            </div>

            {data?.internalNotes && <p>{data?.internalNotes}</p>}
            {data?.notes && <p>{data?.notes}</p>}

            <FormField
              control={form.control}
              name="purchaseOrderItems"
              render={() => (
                <FormItem className="w-full">
                  <FormControl>
                    <Table
                      data={fields}
                      columns={columns}
                      // defaultColumn={defaultColumn}
                      // meta={meta}
                      form={form}
                      errors={errors}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                                    console.error(
                                      "Form submission error:",
                                      error,
                                    );
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
          </>
        )}
      </Form>
    </>
  );
}
