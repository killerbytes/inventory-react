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
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircleIcon,
  Ban,
  Car,
  EllipsisVertical,
  Undo,
} from "lucide-react";
import {
  customerServices,
  productServices,
  salesOrderServices,
} from "@/services";
import { ERROR, ORDER_STATUS, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import DeliveryDetailsModal from "@/components/modals/DeliveryDetailsModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReturnTransactionsTable from "@/components/ReturnTransactionsTable";
import { CancelModal } from "@/components/modals/CancelModal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { formatCurrency } from "@/utils/formatters";
import ColorBadge from "@/components/ColorBadge";
import { salesOrderFormSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import StaticDataTable from "./StaticDataTable";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { useStore } from "@/stores";
import { toast } from "sonner";
import Static from "./Static";

export default function SalesOrderDetails() {
  const [toggle, handleToggle] = useToggle({
    confirmModal: false,
    deliveryDetailsModal: false,
    returnEnabled: false,
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    customerState: { customers, setCustomers },
    salesOrderState: { returnEnabled, setReturnEnabled },
    productState,
  } = useStore();
  const [data, setData] = React.useState<SalesOrder>();

  const form = useForm<SalesOrderForm>({
    resolver: zodResolver(salesOrderFormSchema),
  });

  React.useEffect(() => {
    const getData = async () => {
      const data: CategorizedProductList[] = await productServices.list();
      productState.setProducts(data);
    };

    if (!productState.hasLoaded) {
      getData();
    }
  }, [productState, productState.setProducts, returnEnabled]);

  const getData = useCallback(async () => {
    try {
      const data = await salesOrderServices.get(Number(id));
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.NOT_FOUND) {
        navigate(ROUTES.SALES_ORDERS);
      }
      toast.error("Submission failed - " + apiError.message);
    }
  }, [id, navigate]);

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

  const totalReturnAmount =
    data?.returnTransactions?.reduce(
      (acc, item) => acc + Number(item.totalReturnAmount),
      0,
    ) || 0;
  const totalExchangeAmount =
    data?.returnTransactions?.reduce(
      (acc, item) => acc + Number(item.totalExchangeAmount),
      0,
    ) || 0;

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
            <DropdownMenu
              open={toggle.dropdownMenu}
              onOpenChange={(open) => {
                handleToggle({ dropdownMenu: open });
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleToggle({
                      deliveryDetailsModal: true,
                      dropdownMenu: false,
                    });
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
                      handleToggle({ cancelModal: true, dropdownMenu: false });
                    }}
                  >
                    <Ban color="red" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setReturnEnabled(!returnEnabled);
                    handleToggle({
                      dropdownMenu: false,
                    });
                  }}
                >
                  <Undo />
                  Return/Exchange
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {data && <Static data={data} />}
          {data?.status === ORDER_STATUS.CANCELLED && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Cancellation Reason</AlertTitle>
              <AlertDescription>{data?.cancellationReason}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data && <StaticDataTable data={data} />}

          {data &&
            data?.returnTransactions &&
            data?.returnTransactions.length > 0 && (
              <ReturnTransactionsTable data={data.returnTransactions} />
            )}

          <div className="w-1/3 flex ml-auto">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Sale Amount</TableCell>
                  <TableHead className="text-right">
                    {formatCurrency(Number(data?.totalAmount))}
                  </TableHead>
                </TableRow>

                {totalReturnAmount > 0 && (
                  <TableRow>
                    <TableCell>Total Returns</TableCell>
                    <TableHead className="text-right text-red-500">
                      -{formatCurrency(totalReturnAmount)}
                    </TableHead>
                  </TableRow>
                )}
                {totalExchangeAmount > 0 && (
                  <TableRow>
                    <TableCell>Total Exchanges</TableCell>
                    <TableHead className="text-right ">
                      {formatCurrency(totalExchangeAmount)}
                    </TableHead>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={1} className="font-bold">
                    Grand Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      Number(data?.totalAmount) -
                        totalReturnAmount +
                        totalExchangeAmount,
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
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
          onClose={() => handleToggle({ deliveryDetailsModal: false })}
        />
      )}
    </div>
  );
}
