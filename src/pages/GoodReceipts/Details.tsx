import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiErrorResponse,
  CancelOrder,
  GoodReceipt,
  GoodReceiptCreate,
} from "@/types";
import {
  BUTTON_COLOR,
  ORDER_STATUS,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import {
  Ban,
  ClipboardList,
  EllipsisVertical,
  Save,
  Trash2,
} from "lucide-react";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import { CancelModal } from "../../components/modals/CancelModal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import PendingOrderForm from "./Form/PendingForm";
import { goodReceiptFormSchema } from "@/schemas";
import ColorBadge from "@/components/ColorBadge";
import { goodReceiptServices } from "@/services";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { getErrorMessage } from "@/lib/utils";
import PartialForm from "./Form/PartialForm";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import { toast } from "sonner";

export default function Create() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toggle, handleToggle } = useToggle({
    cancelModal: false,
    dropdownMenu: false,
  });

  const form = useForm<GoodReceiptCreate>({
    resolver: zodResolver(goodReceiptFormSchema),
  });

  async function onSaveOrder(values: GoodReceiptCreate) {
    try {
      await goodReceiptServices.update(Number(id), {
        ...values,
        status: data.status,
      });
      toast.success(`Purchase Order saved successfully`);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
    handleToggle({ dropdownMenu: false });
  }

  async function onReceiveOrder(form: GoodReceiptCreate) {
    try {
      await goodReceiptServices.update(Number(id), {
        ...form,
        status: ORDER_STATUS.RECEIVED,
      });

      toast.success(`Purchase Order received`);
      navigate(ROUTES.GOOD_RECEIPT);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  }

  async function onDeleteOrder() {
    try {
      await goodReceiptServices.delete(Number(id));
      toast.success(`Purchase Order deleted successfully`);
      navigate(ROUTES.GOOD_RECEIPT);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  }

  async function onCancelOrder(form: CancelOrder) {
    try {
      await goodReceiptServices.cancelOrder(Number(id), {
        ...form,
      });
      toast.success(`Purchase Order cancelled successfully`);
      navigate(ROUTES.GOOD_RECEIPT);
    } catch (error) {
      const { message } = getErrorMessage(error as ApiErrorResponse);
      toast.error(`Submission failed, ${message}`);
    }
  }

  const getData = useCallback(async () => {
    try {
      const data = await goodReceiptServices.get(Number(id));
      form.reset(data);
    } catch (error) {
      const { message } = getErrorMessage(error as ApiErrorResponse);
      toast.error(message);
      navigate(ROUTES.GOOD_RECEIPT);
    }
  }, [form, id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const data = useWatch<GoodReceipt>({
    control: form.control,
  }) as GoodReceipt;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            {data?.referenceNo}
          </CardTitle>
          <CardAction className="flex gap-2">
            <ColorBadge colorMap={STATUS_COLOR}>
              {String(data?.status)}
            </ColorBadge>
            <DropdownMenu
              open={toggle.dropdownMenu}
              onOpenChange={(open) => {
                handleToggle({ dropdownMenu: open });
              }}
            >
              <DropdownMenuTrigger
                asChild
                onClick={() => handleToggle({ dropdownMenu: true })}
              >
                <Button variant="outline" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => {
                    handleToggle({
                      orderHistoryModal: true,
                      dropdownMenu: false,
                    });
                  }}
                >
                  <ClipboardList />
                  Order History
                </DropdownMenuItem>

                {(data?.status === ORDER_STATUS.RECEIVED ||
                  data?.status === ORDER_STATUS.COMPLETED) && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleToggle({ cancelModal: true, dropdownMenu: false });
                    }}
                  >
                    <Ban color="red" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
                {data?.status === ORDER_STATUS.DRAFT && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        // e.preventDefault();
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
                      onConfirm={onDeleteOrder}
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
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data?.status === ORDER_STATUS.DRAFT ? (
            <>
              <PendingOrderForm form={form} />
              <div className="flex justify-end mt-auto mb-10">
                <ConfirmDialog
                  title={`Receive Order`}
                  onConfirm={(e) => {
                    e.preventDefault();
                    console.log(form.getValues(), form.formState.errors);
                    form
                      .handleSubmit(onReceiveOrder)(e)
                      .catch((error) => {
                        console.error("Form submission error:", error);
                      });
                  }}
                >
                  <Button
                    variant="outline"
                    className={cx("shadow", BUTTON_COLOR["RECEIVED"])}
                  >
                    Receive Order
                  </Button>
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
        </CardContent>
      </Card>
      {toggle.orderHistoryModal && data?.goodReceiptStatusHistory && (
        <OrderHistoryModal
          data={data.goodReceiptStatusHistory}
          onClose={() => handleToggle({ orderHistoryModal: false })}
        />
      )}
    </div>
  );
}
