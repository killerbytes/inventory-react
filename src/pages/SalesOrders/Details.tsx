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
import { BUTTON_COLOR, ERROR, ORDER_STATUS, ROUTES } from "@/utils/definitions";
import { Ban, EllipsisVertical, Save, Trash2 } from "lucide-react";
import { CancelModal } from "@/components/modals/CancelModal";
import { useCustomerStore } from "@/stores/customer.store";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import OrderHistory from "@/components/OrderHistory";
import { useForm, useWatch } from "react-hook-form";
import StatusBadge from "@/components/StatusBadge";
import { salesOrderCreateSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { useProductStore } from "@/stores";
import React, { useCallback } from "react";
import useToggle from "@/hooks/useToggle";
import FullForm from "./FullForm";
import { toast } from "sonner";
import Static from "./Static";

export default function SalesOrderDetails() {
  const [toggle, handleToggle] = useToggle({ confirmModal: false });
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

  async function onReceiveOrder(form: SalesOrderCreate) {
    try {
      await salesOrderServices.update(Number(id), {
        ...form,
        status: ORDER_STATUS.RECEIVED,
      });

      toast.success(`Sales Order received`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error: any) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
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
      navigate(ROUTES.PURCHASE_ORDERS);
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

  // const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
  //   () => [
  //     {
  //       accessorKey: "index",
  //       header: "",
  //       meta: {
  //         className: "w-0",
  //       },
  //       cell: ({ row }) => (
  //         <Button
  //           onClick={() => remove(row.index)}
  //           variant="outline"
  //           type="button"
  //         >
  //           <Trash2 />
  //         </Button>
  //       ),
  //     },
  //     {
  //       accessorKey: "combinationId",
  //       header: "Product",
  //       meta: {
  //         className: "w-100",
  //       },
  //       cell: ({ row }) => {
  //         return (
  //           <Controller
  //             name={`salesOrderItems.${row.index}.combinationId`}
  //             control={form.control}
  //             render={({ field }) => {
  //               return (
  //                 <ProductCommand
  //                   {...field}
  //                   control={form.control}
  //                   list={products}
  //                   index={row.index}
  //                   value={String(field.value)}
  //                   field="salesOrderItems"
  //                   onChange={(value) => {
  //                     field.onChange(value);
  //                     const selected = flatProducts.find(
  //                       (item) => item.combinationId === Number(value),
  //                     );
  //                     if (selected) {
  //                       form.setValue(
  //                         `salesOrderItems.${row.index}.purchasePrice`,
  //                         selected.price,
  //                       );
  //                     }
  //                   }}
  //                   renderOption={(combination, onChange) => {
  //                     return (
  //                       <CommandItem
  //                         keywords={[combination.sku ?? ""]}
  //                         value={String(combination.id)}
  //                         key={combination.id}
  //                         onSelect={onChange}
  //                         className="flex gap-2 items-center justify-between"
  //                       >
  //                         <div className="flex gap-2 items-center">
  //                           {combination.values.map((value) => {
  //                             return <span key={value.id}>{value.value}</span>;
  //                           })}
  //                           {combination.inventory?.quantity !== undefined &&
  //                             combination.inventory?.quantity > 0 && (
  //                               <small className="text-muted-foreground">
  //                                 x{combination.inventory?.quantity}
  //                               </small>
  //                             )}
  //                         </div>
  //                         <span className="text-muted-foreground">
  //                           {formatCurrency(combination.price)}
  //                         </span>
  //                       </CommandItem>
  //                     );
  //                   }}
  //                 />
  //               );
  //             }}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       accessorKey: "purchasePrice",
  //       header: "Price",
  //       meta: {
  //         className: "text-right min-w-[100px] w-[110px]",
  //       },
  //       cell: ({ row }) => (
  //         <FormField
  //           control={form.control}
  //           name={`salesOrderItems.${row.index}.purchasePrice`}
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormControl>
  //                 <NumberInput
  //                   {...field}
  //                   value={Number(field.value)}
  //                   type="currency"
  //                 />
  //               </FormControl>
  //             </FormItem>
  //           )}
  //         />
  //       ),
  //     },
  //     {
  //       accessorKey: "quantity",
  //       header: "Quantity",
  //       meta: {
  //         className: "text-right min-w-[90px] w-[90px]",
  //       },
  //       cell: ({ row }) => (
  //         <Controller
  //           name={`salesOrderItems.${row.index}.quantity`}
  //           control={form.control}
  //           render={({ field }) => <NumberInput {...field} />}
  //         />
  //       ),
  //     },
  //     {
  //       accessorKey: "unit",
  //       header: "Unit",
  //       meta: {
  //         className: "w-15",
  //       },
  //       cell: ({ row }) => {
  //         return <UnitColumn index={row.index} form={form} />;
  //       },
  //     },
  //     {
  //       accessorKey: "discount",
  //       header: "Discount",
  //       meta: {
  //         className: "text-right w-32",
  //         type: "currency",
  //       },
  //       cell: ({ row }) => (
  //         <Controller
  //           name={`salesOrderItems.${row.index}.discount`}
  //           control={form.control}
  //           render={({ field }) => <NumberInput {...field} type="currency" />}
  //         />
  //       ),
  //     },
  //     {
  //       accessorKey: "discountNote",
  //       header: "Discount Note",
  //       meta: {
  //         className: "w-50",
  //       },
  //       cell: ({ row }) => (
  //         <Controller
  //           name={`salesOrderItems.${row.index}.discountNote`}
  //           control={form.control}
  //           render={({ field }) => <Input {...field} />}
  //         />
  //       ),
  //     },
  //     {
  //       accessorKey: "amount",
  //       header: () => <div className="text-right">Amount</div>,
  //       meta: {
  //         className: "text-right w-20",
  //       },

  //       cell: ({ row }) => (
  //         <AmountColumn index={row.index} control={form.control} />
  //       ),
  //     },
  //   ],
  //   [flatProducts, form, products, remove],
  // );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Sales Order</CardTitle>
          <CardAction className="flex gap-2">
            <StatusBadge>{String(data?.status)}</StatusBadge>
            {data?.status !== ORDER_STATUS.CANCELLED && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="size-8">
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
            )}
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
      <OrderHistory
        data={
          "salesOrderStatusHistory" in data ? data?.salesOrderStatusHistory : []
        }
      />
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
    </div>
  );
}
