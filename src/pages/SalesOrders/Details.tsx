import {
  ApiErrorResponse,
  CancelOrder,
  CategorizedProductList,
  Customer,
  SalesOrder,
  SalesOrderForm,
} from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  customerServices,
  productServices,
  salesOrderServices,
} from "@/services";
import { ERROR, ORDER_STATUS, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import DeliveryDetailsModal from "@/components/modals/DeliveryDetailsModal";
import { CancelModal } from "@/components/modals/CancelModal";
import { useCustomerStore } from "@/stores/customer.store";
import { Ban, Car, EllipsisVertical } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import ColorBadge from "@/components/ColorBadge";
import { salesOrderFormSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import StaticDataTable from "./StaticDataTable";
import { useProductStore } from "@/stores";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import { toast } from "sonner";
import Static from "./Static";

export default function SalesOrderDetails() {
  const [toggle, handleToggle] = useToggle({
    confirmModal: false,
    deliveryDetailsModal: false,
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const { setProducts } = useProductStore();
  const { customers, setCustomers } = useCustomerStore();

  const form = useForm<SalesOrderForm>({
    resolver: zodResolver(salesOrderFormSchema),
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
  const data = useWatch<SalesOrder>({
    control: form.control,
  }) as SalesOrder;

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
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Static data={data} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <StaticDataTable data={data} />
        </CardContent>
      </Card>

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
