import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  useCancelSalesOrder,
  useSalesOrder,
} from "@/features/sales-orders/hooks/useSalesOrders";
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
import StaticDataTable from "../../features/sales-orders/components/StaticDataTable";
import DeliveryDetailsModal from "@/components/modals/DeliveryDetailsModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReturnTransactionsTable from "@/components/ReturnTransactionsTable";
import { ORDER_STATUS, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import Static from "../../features/sales-orders/components/Static";
import { CancelModal } from "@/components/modals/CancelModal";
import { ApiErrorResponse, CancelOrder } from "@/schemas";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, useParams } from "react-router";
import { formatCurrency } from "@/utils/formatters";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import useToggle from "@/hooks/useToggle";
import Loader from "@/components/Loader";
import { useStore } from "@/stores";
import { toast } from "sonner";

export default function SalesOrderDetails() {
  const [toggle, handleToggle] = useToggle({
    confirmModal: false,
    deliveryDetailsModal: false,
    returnEnabled: false,
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    salesOrderState: { returnEnabled, setReturnEnabled },
  } = useStore();
  const { data, isError, error, isLoading } = useSalesOrder(Number(id));
  const { mutate: cancelSalesOrder } = useCancelSalesOrder();

  if (isError) {
    toast.error("Submission failed - " + error?.message);
    navigate(ROUTES.SALES_ORDERS);
  }

  async function onCancelOrder(form: CancelOrder) {
    cancelSalesOrder(
      {
        id: Number(id),
        data: form,
      },
      {
        onSuccess: () => {
          toast.success(`Purchase Order cancelled successfully`);
          navigate(ROUTES.SALES_ORDERS);
        },
        onError: (error: unknown) => {
          const apiError = error as ApiErrorResponse;
          toast.error(`Submission failed, ${apiError.message}`);
        },
      },
    );
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
        <CardHeader className="px-2 md:px-4">
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Sales Order
          </CardTitle>
          <CardAction className="flex gap-2">
            <ColorBadge colorMap={STATUS_COLOR}>
              {String(data?.status)}
            </ColorBadge>
            {data?.status !== ORDER_STATUS.VOID && (
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
                    <>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          handleToggle({
                            cancelModal: true,
                            dropdownMenu: false,
                          });
                        }}
                      >
                        <Ban color="red" />
                        Cancel Order
                      </DropdownMenuItem>
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
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-2 md:px-4">
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
          {isLoading && <Loader />}
          {data && <StaticDataTable data={data} />}

          {data &&
            data?.returnTransactions &&
            data?.returnTransactions.length > 0 && (
              <ReturnTransactionsTable data={data.returnTransactions} />
            )}

          <div className="md:w-1/3 flex ml-auto">
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
