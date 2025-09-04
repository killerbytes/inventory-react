import {
  ApiErrorResponse,
  CancelOrder,
  CategorizedProductList,
  Customer,
  SalesOrder,
  SalesOrderCreate,
} from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  BUTTON_COLOR,
  ERROR,
  ORDER_STATUS,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Ban,
  Car,
  ClipboardList,
  EllipsisVertical,
  Save,
  Trash2,
} from "lucide-react";
import {
  customerServices,
  productServices,
  salesOrderServices,
} from "@/services";
import DeliveryDetailsModal from "@/components/modals/DeliveryDetailsModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import { CancelModal } from "@/components/modals/CancelModal";
import { useCustomerStore } from "@/stores/customer.store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { salesOrderCreateSchema } from "@/schemas";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import StaticDataTable from "./StaticDataTable";
import { cx } from "class-variance-authority";
import { useProductStore } from "@/stores";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import FullForm from "./FullForm";
import { toast } from "sonner";
import Static from "./Static";

export default function SalesOrderDetails() {
  const [toggle, handleToggle] = useToggle({
    confirmModal: false,
    deliveryDetailsModal: false,
    orderHistoryModal: false,
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const { setProducts } = useProductStore();
  const { customers, setCustomers } = useCustomerStore();

  const form = useForm<SalesOrderCreate>({
    resolver: zodResolver(salesOrderCreateSchema),
  });

  React.useEffect(() => {
    const getData = async () => {
      const data: CategorizedProductList[] = await productServices.list();
      setProducts(data);
    };
    getData();
  }, [setProducts]);

  const getData = useCallback(async () => {
    try {
      const data = await salesOrderServices.get(Number(id));
      form.reset(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.log(apiError);
      if (apiError.code === ERROR.NOT_FOUND) {
        navigate(ROUTES.SALES_ORDERS);
      }
      toast.error("Submission failed - " + apiError.message);
    }
  }, [form, id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    const getData = async () => {
      const data: Customer[] = await customerServices.list();
      setCustomers(data);
    };
    if (customers.length === 0) {
      getData();
    }
  }, [customers.length, setCustomers]);

  async function onReceiveOrder(values: SalesOrderCreate) {
    try {
      await salesOrderServices.update(Number(id), {
        ...values,
        status: ORDER_STATUS.RECEIVED,
      });

      toast.success(`Sales Order received`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error: any) {
      const apiError = error as ApiErrorResponse;
      apiError.errors.forEach((err) => {
        if (err.field) {
          form.setError(err.field as keyof SalesOrderCreate, {
            type: "server",
            message: err.message,
          });
        }
      });
    }
  }
  async function onSaveOrder(form: SalesOrder) {
    try {
      await salesOrderServices.update(Number(id), {
        ...form,
        status: data.status,
      });
      toast.success(`Purchase Order saved successfully`);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  }

  async function onCancelOrder(form: CancelOrder) {
    try {
      await salesOrderServices.cancelOrder(Number(id), {
        ...form,
      });
      toast.success(`Purchase Order cancelled successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(`Submission failed, ${apiError.message}`);
    }
  }
  async function onDeleteOrder() {
    try {
      await salesOrderServices.delete(Number(id));
      toast.success(`Sales Order deleted successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error: any) {
      toast.error("Submission failed - " + error?.response.data.error);
    }
  }
  const data = useWatch<SalesOrder | SalesOrderCreate>({
    control: form.control,
  }) as SalesOrder | SalesOrderCreate;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Sales Order
          </CardTitle>
          <CardAction className="flex gap-2">
            <ColorBadge colorMap={STATUS_COLOR}>
              {String(data?.status)}
            </ColorBadge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleToggle({ orderHistoryModal: true });
                  }}
                >
                  <ClipboardList />
                  Order History
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleToggle({ deliveryDetailsModal: true });
                  }}
                >
                  <Car />
                  Delivery Details
                </DropdownMenuItem>

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
                {data?.status === ORDER_STATUS.DRAFT && (
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
          {"status" in data && data.status === ORDER_STATUS.RECEIVED ? (
            <Static data={data} />
          ) : (
            <>
              <FullForm form={form} />
              <div className="flex justify-end">
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
          )}
        </CardContent>
      </Card>
      {"status" in data && data.status === ORDER_STATUS.RECEIVED && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <StaticDataTable data={data} />
          </CardContent>
        </Card>
      )}

      {toggle.orderHistoryModal && (
        <OrderHistoryModal
          data={
            "salesOrderStatusHistory" in data
              ? data?.salesOrderStatusHistory
              : []
          }
          onClose={() => handleToggle({ orderHistoryModal: false })}
        />
      )}
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
      {toggle.deliveryDetailsModal && (
        <DeliveryDetailsModal
          data={data}
          isOpen={toggle.deliveryDetailsModal}
          onClose={() => handleToggle({ deliveryDetailsModal: false })}
        />
      )}
    </div>
  );
}
