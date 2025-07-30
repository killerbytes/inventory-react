import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiErrorResponse, CancelPurchaseOrder, PurchaseOrder } from "@/types";
import { Ban, EllipsisVertical, MoveLeft, Save, Trash2 } from "lucide-react";
import { MODE_OF_PAYMENT, ORDER_STATUS, ROUTES } from "@/utils/definitions";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { purchaseOrderServices } from "@/services";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import { getErrorMessage } from "@/lib/utils";
import PartialForm from "./Form/PartialForm";
import { Form } from "@/components/ui/form";
import { CancelModal } from "./CancelModal";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import OrderForm from "./Form/OrderForm";
import Badge from "@/components/Badge";
import { toast } from "sonner";
import { z } from "zod";

export default function Create() {
  // const [data, setData] = React.useState<PurchaseOrder | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toggle, handleToggle } = useToggle({
    cancelModal: false,
  });

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),
    // defaultValues,
  });
  const { reset } = form;

  async function onSaveOrder(form: PurchaseOrder) {
    try {
      await purchaseOrderServices.update(id!, form);
      toast.success(`Purchase Order saved successfully`);
    } catch (error) {
      const { message } = getErrorMessage(error as ApiErrorResponse);
      toast.error("Submission failed - " + message);
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

  async function onCancelOrder(form: CancelPurchaseOrder) {
    try {
      await purchaseOrderServices.cancelOrder(id!, {
        ...form,
        status: ORDER_STATUS.CANCELLED,
      });
      toast.success(`Purchase Order cancelled successfully`);
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      const { message } = getErrorMessage(error as ApiErrorResponse);
      toast.error(`Submission failed, ${message}`);
    }
  }

  const getData = useCallback(async () => {
    try {
      const data = await purchaseOrderServices.get(id);
      reset(data);
    } catch (error) {
      const { message } = getErrorMessage(error as ApiErrorResponse);
      toast.error("Submission failed - " + message);
      navigate(ROUTES.PURCHASE_ORDERS);
    }
  }, [id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const data = useWatch({
    control: form.control,
  });

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
                        <Trash2 color="red" />
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
            <OrderForm form={form} />
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
            <PartialForm form={form} />
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
        )}
      </Form>
    </>
  );
}
