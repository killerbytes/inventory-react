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
import { useNavigate, useParams } from "react-router";
import { hasRole, ROLES } from "@/utils/permissions";
import { formatCurrency } from "@/utils/formatters";
import PageHeader from "@/components/PageHeader";
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
  const { authState } = useStore();
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
    <>
      <>
        <PageHeader title={`Sales Order #${data?.salesOrderNumber}`}>
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
                    {hasRole(authState.user.role, [
                      ROLES.ADMIN,
                      ROLES.MANAGER,
                    ]) && (
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
                    )}
                    {hasRole(authState.user.role, [
                      ROLES.ADMIN,
                      ROLES.MANAGER,
                    ]) && (
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
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </PageHeader>

        <>
          {data && <Static data={data} />}
          {data?.status === ORDER_STATUS.CANCELLED && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Cancellation Reason</AlertTitle>
              <AlertDescription>{data?.cancellationReason}</AlertDescription>
            </Alert>
          )}
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
                  <TableCell className="font-semibold text-muted-foreground">
                    Sale Amount
                  </TableCell>
                  <TableHead className="text-right">
                    {formatCurrency(Number(data?.totalAmount))}
                  </TableHead>
                </TableRow>

                {totalReturnAmount > 0 && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      Total Returns
                    </TableCell>
                    <TableHead className="text-right text-red-500">
                      -{formatCurrency(totalReturnAmount)}
                    </TableHead>
                  </TableRow>
                )}
                {totalExchangeAmount > 0 && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">
                      Total Exchanges
                    </TableCell>
                    <TableHead className="text-right">
                      {formatCurrency(totalExchangeAmount)}
                    </TableHead>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={1}
                    className="font-bold text-muted-foreground"
                  >
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
        </>
      </>

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
    </>
  );
}
