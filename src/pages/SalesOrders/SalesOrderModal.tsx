import {
  ApiError,
  ApiErrorResponse,
  Customer,
  SalesOrder,
  salesOrderBaseSchema,
  SalesOrderForm,
  SalesOrderItem,
} from "@/schemas";
import {
  ERROR,
  MODE_OF_PAYMENT_OPTIONS,
  ORDER_STATUS,
  UNIT_COLOR,
  WHOLESALE_UNITS,
} from "@/utils/definitions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import ProductLookupInput from "@/components/forms/ProductLookupInput";
import LineColumn from "@/components/forms/OrderItemForm/LineColumn";
import { BanknoteArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { customerServices, salesOrderServices } from "@/services";
import { TableCell, TableRow } from "@/components/ui/table";
import { getTotalAmountTableFooter } from "@/lib/utils";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Autocomplete from "@/components/Autcomplete";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { Spinner } from "@/components/ui/spinner";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import { useStore } from "@/stores";
import { toast } from "sonner";
import React from "react";

const salesOrderItemDefault = {
  quantity: 1,
  purchasePrice: 0,
  discount: 0,
  discountNote: "",
  combinationId: -1,
};
const salesOrderDefalt = {
  // deliveryDate: new Date().toISOString(),
  orderDate: new Date().toISOString(),
  customerId: 1,
  modeOfPayment: "CASH",
  status: "DRAFT",
  salesOrderItems: Array.from({ length: 3 }, () => salesOrderItemDefault),
  isDelivery: false,
};

export default function SalesOrderModal({
  data,
  isOpen,
  onClose,
}: {
  data: SalesOrder;
  isOpen: boolean;
  onClose: (reload: boolean) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const { customerState } = useStore();

  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
  )
    ? JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
        ) as string,
      )
    : salesOrderDefalt;

  const form = useForm<SalesOrderForm>({
    resolver: zodResolver(salesOrderBaseSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salesOrderItems",
    keyName: "formId",
  });
  const watchSalesOrderItems = useWatch({
    control: form?.control,
    name: "salesOrderItems",
  }) as SalesOrderItem[];

  const tableData = fields.map((field, index) => ({
    ...field,
    ...watchSalesOrderItems?.[index],
  }));
  const modeOfPayment = form.watch("modeOfPayment");

  React.useEffect(() => {
    const getData = async () => {
      const res = await salesOrderServices.get(Number(data.id));
      form.reset(res);
    };
    if (data) {
      getData();
    }
  }, [data, form]);

  React.useEffect(() => {
    const getData = async () => {
      const data: Customer[] = await customerServices.list();
      customerState.setCustomers(data);
    };
    if (!customerState.hasLoaded) {
      getData();
    }
  }, [customerState]);

  async function onSubmit(values: SalesOrderForm) {
    try {
      setLoading(true);
      await salesOrderServices.create(values);
      localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`);
      toast.success(`Sales Order submitted successfully`);
      onClose(true);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof SalesOrderForm, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
    } finally {
      setLoading(false);
    }
  }
  async function onSave(values: SalesOrderForm) {
    try {
      setLoading(true);
      await salesOrderServices.update(Number(data.id), values as SalesOrder);
      localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`);
      toast.success(`Sales Order saved successfully`);
      onClose(true);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err: ApiError) => {
          if (err.field) {
            form.setError(err.field as keyof SalesOrderForm, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed - " + apiError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const saveDraft = React.useCallback(() => {
    const draft =
      JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
        ) as string,
      ) || {};
    const newDraft = { ...form.getValues() };

    if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
      localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_SALES_DRAFT`,
        JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v)),
      );
    }
  }, [form]);
  const formData = useWatch({ control: form.control });

  const debouncedFormData = useDebounce(formData, 1000);

  React.useEffect(() => {
    if (!data) {
      saveDraft();
    }
  }, [data, debouncedFormData, saveDraft]);

  async function onDeleteOrder() {
    try {
      await salesOrderServices.delete(Number(data.id));
      toast.success(`Sales Order deleted successfully`);
      onClose(true);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  }

  const columns = React.useMemo<ColumnDef<SalesOrderItem>[]>(
    () => [
      {
        accessorKey: "index",
        header: "",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="outline"
            type="button"
          >
            <Trash2 />
          </Button>
        ),
      },

      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-center",
          className: "text-right min-w-[90px] w-[90px]",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`salesOrderItems.${row.index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput
                    {...field}
                    // value={Number(field.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        meta: {
          className: "w-15 text-center",
          headerClassName: "text-center",
        },
        cell: ({ row }) => {
          return (
            <LineColumn
              index={row.index}
              control={form.control}
              name="salesOrderItems"
            >
              {(value) => {
                return (
                  value.combinations?.unit && (
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {value.combinations?.unit}
                    </ColorBadge>
                  )
                );
              }}
            </LineColumn>
          );
        },
      },
      {
        accessorKey: "combinationId",
        header: "Product",
        meta: {
          className: "w-[35%]",
        },
        cell: ({ row }) => {
          return (
            <Controller
              name={`salesOrderItems.${row.index}.combinationId`}
              control={form.control}
              render={({ field }) => {
                return (
                  <>
                    <FormItem>
                      <FormControl>
                        <ProductLookupInput
                          ariaInvalid={Boolean(
                            form.formState.errors?.salesOrderItems?.[row.index]
                              ?.combinationId,
                          )}
                          index={row.index}
                          disableNoQuantity
                          form={form}
                          {...field}
                          name="salesOrderItems"
                          onChange={(value) => {
                            field.onChange(value.id);
                            form.setValue(
                              `salesOrderItems.${row.index}.purchasePrice`,
                              value.price ?? 0,
                            );
                            form.setValue(
                              `salesOrderItems.${row.index}.combinations`,
                              value,
                            );

                            setTimeout(() => {
                              if (row.index + 1 === fields.length) {
                                const button: HTMLButtonElement | null =
                                  document.querySelector(".append-btn");
                                if (button) {
                                  button.focus();
                                }
                              } else {
                                form.setFocus(
                                  `salesOrderItems.${row.index + 1}.quantity`,
                                );
                              }
                            }, 0);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  </>
                );
              }}
            />
          );
        },
      },

      {
        accessorKey: "discount",
        header: "Discount",
        meta: {
          className: "text-right",
          type: "currency",
        },
        cell: ({ row }) => (
          <Controller
            name={`salesOrderItems.${row.index}.discount`}
            control={form.control}
            render={({ field }) => <NumberInput {...field} type="currency" />}
          />
        ),
      },
      {
        accessorKey: "discountNote",
        header: "Discount Note",
        meta: {},
        cell: ({ row }) => (
          <Controller
            name={`salesOrderItems.${row.index}.discountNote`}
            control={form.control}
            render={({ field }) => (
              <Input {...field} value={field.value ?? ""} />
            )}
          />
        ),
      },

      {
        accessorKey: "purchasePrice",
        header: "Price",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`salesOrderItems.${row.index}.purchasePrice`}
            render={() => {
              return (
                <FormItem
                  className={cx({
                    "text-red-500 font-bold": Boolean(
                      form.formState.errors?.salesOrderItems?.[row.index]
                        ?.purchasePrice,
                    ),
                  })}
                >
                  <FormControl>
                    <LineColumn
                      index={row.index}
                      control={form.control}
                      name="salesOrderItems"
                    >
                      {(value) => formatCurrency(value.purchasePrice)}
                    </LineColumn>
                  </FormControl>
                </FormItem>
              );
            }}
          />
        ),
      },

      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right",
        },

        cell: ({ row }) => (
          <LineColumn
            index={row.index}
            control={form.control}
            name="salesOrderItems"
          >
            {(value) => {
              const q = Number(value.quantity);
              const p =
                Number(value.purchasePrice) - Number(value.discount) / q;
              return formatCurrency(q * p);
            }}
          </LineColumn>
        ),
      },
    ],
    [fields.length, form, remove],
  );

  const isDelivery = useWatch({ control: form.control, name: "isDelivery" });
  return (
    <Modal
      title="Create Sales Order"
      isOpen={isOpen}
      onOpenChange={() => onClose(false)}
      size="xl"
    >
      <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4 md:max-h-full">
        <Form {...form}>
          <form className="flex flex-col gap-4 ">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Autocomplete
                    value={
                      customerState.customers.find(
                        (customer) => customer.id === field.value,
                      )?.name
                    }
                    options={customerState.customers}
                    placeholder="Customer"
                    onChange={(value) => {
                      form.setValue("customerId", Number(value.id), {
                        shouldValidate: true,
                      });
                    }}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex flex-col gap-4 items-start md:flex-row">
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/4">
                    <FormLabel>Order Date</FormLabel>
                    <DatePicker {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modeOfPayment"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/4">
                    <FormLabel>Mode of Payment</FormLabel>
                    <Select {...field} options={MODE_OF_PAYMENT_OPTIONS} />

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkNumber"
                render={({ field }) => {
                  return (
                    <FormItem
                      className={cx(
                        "w-full md:w-1/4",
                        modeOfPayment !== "CHECK" && "opacity-50",
                      )}
                    >
                      <FormLabel>Check Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={modeOfPayment !== "CHECK"}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem
                    className={cx(
                      "w-full md:w-1/4",
                      modeOfPayment !== "CHECK" && "opacity-50",
                    )}
                  >
                    <FormLabel>Due Date</FormLabel>
                    <DatePicker
                      {...field}
                      disabled={modeOfPayment !== "CHECK"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Tabs defaultValue="notes">
              <TabsList>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="internalNotes">Internal Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="notes">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
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
              </TabsContent>
              <TabsContent value="internalNotes">
                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter some internal notes not visible to customer..."
                          className="resize-none"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            <FormField
              control={form.control}
              name="salesOrderItems"
              render={() => (
                <FormItem className="w-full mb-4">
                  <FormControl>
                    <DataTable
                      data={tableData}
                      columns={columns}
                      renderFooter={(data) => {
                        const total = getTotalAmountTableFooter(data);
                        return (
                          <>
                            <TableRow>
                              <TableCell colSpan={8}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="shadow-sm append-btn"
                                  onClick={() => append(salesOrderItemDefault)}
                                >
                                  <Plus />
                                </Button>
                              </TableCell>
                            </TableRow>
                            <TableRow className="font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell colSpan={10} className="text-right">
                                {formatCurrency(
                                  total?.amount - total?.discount,
                                )}
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                      }}
                      value={String(field.value)}
                    />
                  </FormControl>
                  <FormLabel>For Delivery</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isDelivery && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                  <CardAction>
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-[200px]">
                          <FormLabel>Delivery Date</FormLabel>
                          <DatePicker {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
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
                      name="deliveryInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Notes</FormLabel>
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
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
      <DialogFooter>
        {data && (
          <div className="mr-auto">
            <ConfirmDialog title={`Void order`} onConfirm={onDeleteOrder}>
              <Button
                variant="outline"
                className="text-red-500 shadow-sm"
                tabIndex={-1}
              >
                <Trash2 />
              </Button>
            </ConfirmDialog>
          </div>
        )}

        <Button
          className="shadow-sm"
          variant="secondary"
          type="button"
          disabled={loading}
          onClick={(e) => {
            console.log(form.getValues(), form.formState.errors);
            form.handleSubmit((props) =>
              data
                ? onSave({ ...props, status: ORDER_STATUS.DRAFT })
                : onSubmit({ ...props, status: ORDER_STATUS.DRAFT }),
            )(e);
          }}
        >
          {loading ? <Spinner data-icon="inline-start" /> : <Save />}
          Save as Draft
        </Button>
        <ConfirmDialog
          title="Create Invoice"
          description="Are you sure you want to create this invoice? This action cannot be undone."
          isLoading={loading}
          shouldConfirm={() =>
            formData.salesOrderItems?.some(({ combinations }) =>
              Object.values(WHOLESALE_UNITS).includes(combinations?.unit ?? ""),
            ) ?? false
          }
          onConfirm={(e) => {
            e.preventDefault();
            console.log(form.getValues(), form.formState.errors);
            form
              .handleSubmit((props) =>
                data
                  ? onSave({ ...props, status: ORDER_STATUS.RECEIVED })
                  : onSubmit({ ...props, status: ORDER_STATUS.RECEIVED }),
              )(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
        >
          <Button className="shadow-sm bg-green-500 hidden md:inline-flex">
            <BanknoteArrowUp /> Create Order
          </Button>
        </ConfirmDialog>
      </DialogFooter>

      {/* {JSON.stringify(tableData, null, 2)} */}
    </Modal>
  );
}
