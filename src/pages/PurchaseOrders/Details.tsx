import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Ban, EllipsisVertical, MoveLeft, Save, Trash2 } from "lucide-react";
import { MODE_OF_PAYMENT, ORDER_STATUS, ROUTES } from "@/utils/definitions";
import { FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { formatCurrency, formatDate } from "@/utils/formatters";
import SupplierPanel from "@/components/SupplierPanel";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { Textarea } from "@/components/ui/textarea";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import { CancelModal } from "./CancelModal";
import Tooltip from "@/components/Tooltip";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import Badge from "@/components/Badge";
import { toast } from "sonner";
import Table from "./Table";
import { z } from "zod";

export default function Create() {
  const [data, setData] = React.useState<PurchaseOrder | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toggle, handleToggle } = useToggle({
    cancelModal: false,
  });

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

  async function onCompleteOrder(form: PurchaseOrder) {
    try {
      await purchaseOrderServices.update(id!, {
        ...form,
        status: ORDER_STATUS.COMPLETED,
      });

      toast.success(`Purchase Order completed successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  async function onSaveOrder(form: PurchaseOrder) {
    try {
      console.log(form);

      await purchaseOrderServices.update(id!, form);
      toast.success(`Purchase Order saved successfully`);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }

  async function onReceiveOrder(form: PurchaseOrder) {
    try {
      await purchaseOrderServices.update(id!, {
        ...form,
        status: ORDER_STATUS.RECEIVED,
      });

      toast.success(`Purchase Order received`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
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

  async function onCancelOrder(form) {
    try {
      await purchaseOrderServices.cancelOrder(id!, {
        ...form,
        status: ORDER_STATUS.CANCELLED,
      });
      toast.success(`Purchase Order cancelled successfully`);
      // navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      toast.error(`Submission failed, ${error.response.data.message}`);
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

      <div className="mb-4 md:flex  md:justify-between items-center">
        <h1 className="my-4">Purchase Order #{data?.purchaseOrderNumber}</h1>

        <div className="flex gap-2">
          {data?.modeOfPayment === MODE_OF_PAYMENT.CHECK && (
            <>
              <Badge type="check">Check Payment</Badge>
            </>
          )}
          <Badge type={data?.status} />
          {data?.status !== ORDER_STATUS.CANCELLED && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(data?.status === ORDER_STATUS.RECEIVED ||
                  data?.status === ORDER_STATUS.COMPLETED) && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleToggle({ cancelModal: true });
                    }}
                  >
                    <Ban color="red" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
                {data?.status === ORDER_STATUS.PENDING && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(form.formState.errors);
                        form
                          .handleSubmit(onSaveOrder)(e)
                          .catch((error) => {
                            console.error("Form submission error:", error);
                          });
                      }}
                    >
                      <Save color="green" />
                      Save
                    </DropdownMenuItem>
                    <ConfirmDialog
                      title={`Void order`}
                      onConfirm={onDeleleOrder}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 />
                        Void
                      </DropdownMenuItem>
                    </ConfirmDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Form {...form}>
        {data?.status === ORDER_STATUS.PENDING ? (
          <>
            <PurchaseOrderForm form={form} />
            <div className="flex justify-end mt-auto mb-10">
              <ConfirmDialog
                title={`Receive Order`}
                onConfirm={(e) => {
                  e.preventDefault();
                  console.log(form.formState.errors);
                  form
                    .handleSubmit(onReceiveOrder)(e)
                    .catch((error) => {
                      console.error("Form submission error:", error);
                    });
                }}
              >
                <Button>Receive Order</Button>
              </ConfirmDialog>
            </div>
          </>
        ) : (
          <>
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
                        <Badge>{data?.checkNumber}</Badge>
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

            <FormField
              control={form.control}
              name="purchaseOrderItems"
              render={() => (
                <Table data={fields} columns={columns} errors={errors} />
              )}
            />

            <div className="mt-auto mb-10">
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

              {data?.status === ORDER_STATUS.CANCELLED && (
                <>
                  <FormItem className="mb-4">
                    <FormLabel>Cancellation Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter some notes..."
                        className="resize-none"
                        defaultValue={data?.cancellationReason ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </>
              )}

              <div className="flex justify-end">
                {data?.status === ORDER_STATUS.RECEIVED && (
                  <ConfirmDialog
                    title="Complete Order"
                    onConfirm={(e) => {
                      e.preventDefault();
                      console.log(form.formState.errors);
                      form
                        .handleSubmit(onCompleteOrder)(e)
                        .catch((error) => {
                          console.error("Form submission error:", error);
                        });
                    }}
                  >
                    <Button>Complete Order</Button>
                  </ConfirmDialog>
                )}
              </div>
            </div>
          </>
        )}
      </Form>
      {toggle.cancelModal && (
        <CancelModal
          isOpen={true}
          onClose={() => handleToggle({ cancelModal: false })}
          onSubmit={(data) => {
            handleToggle({ cancelModal: false });
            onCancelOrder(data);
          }}
        />
      )}
    </>
  );
}
