import {
  Control,
  Controller,
  FieldValues,
  Path,
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  ApiErrorResponse,
  ExchangeItemForm,
  ReturnForm,
  returnFormSchema,
  ReturnItem,
  ReturnItemForm,
} from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { goodReceiptServices, salesOrderServices } from "@/services";
import ProductLookupInput from "../forms/ProductLookupInput";
import LineColumn from "../forms/OrderItemForm/LineColumn";
import { getTotalAmountTableFooter } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency } from "@/utils/formatters";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell, TableRow } from "../ui/table";
import { UNIT_COLOR } from "@/utils/definitions";
import { cx } from "class-variance-authority";
import { Plus, Trash2 } from "lucide-react";
import { DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import NumberInput from "../NumberInput";
import { DataTable } from "../DataTable";
import ColorBadge from "../ColorBadge";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Modal from "../Modal";
import React from "react";

export default function ReturnExchangeModal({
  onClose,
  returns,
  referenceId,
  salesOrder = false,
}: {
  onClose: () => void;
  returns: ReturnItemForm[];
  referenceId: number;
  salesOrder?: boolean;
}) {
  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      returns,
      exchanges: [],
    },
  });
  const returnsFieldArray = useFieldArray({
    control: form.control,
    name: "returns",
    keyName: "fieldId",
  });

  const exchange = useFieldArray({
    control: form.control,
    name: "exchanges",
  });

  const fieldReturns = useWatch({ control: form.control, name: "returns" });
  const fieldExchanges = useWatch({ control: form.control, name: "exchanges" });

  const handleReturn = async (values: ReturnForm) => {
    try {
      const returns = values.returns.map((i) => ({
        combinationId: i.combinationId,
        quantity: i.returnQuantity,
      })) as ReturnItem[];

      if (salesOrder) {
        await salesOrderServices.returnExchange(referenceId, {
          ...values,
          returns,
        });
      } else {
        await goodReceiptServices.supplierReturns(referenceId, {
          ...values,
          returns,
        });
      }
      toast.success("Supplier Returns submitted successfully");
      onClose();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  };

  const returnColumns = React.useMemo<ColumnDef<ReturnItemForm>[]>(
    () => [
      {
        header: () => "Quantity",
        accessorKey: "quantity",
        meta: {
          headerClassName: "text-right w-0",
          className: "text-right",
        },
        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        meta: {
          headerClassName: "w-0",
        },
        accessorKey: "nameSnapshot",
        header: "Product",
      },
      {
        header: "Unit",
        meta: {
          headerClassName: "w-0",
        },
        accessorKey: "unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.unit)}
            </ColorBadge>
          );
        },
      },

      {
        accessorKey: "purchasePrice",
        header: "Average Price",
        meta: {
          headerClassName: "w-0",
        },
        cell: ({ row }) => {
          const p =
            Number(row.original.purchasePrice) -
            row.original.discount / row.original.quantity;
          return formatCurrency(p);
        },
      },
      {
        accessorKey: "returnQuantity",
        header: () => <div className="text-right">Return Quantity</div>,
        meta: {
          className: "text-right w-0",
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`returns.${row.index}.returnQuantity`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput {...field} value={Number(field.value)} />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Amount",
        meta: {
          headerClassName: "text-right w-0",
          className: "text-right",
        },
        cell: ({ row }) => (
          <AmountColumn
            index={row.index}
            control={form.control}
            name="returns"
          />
        ),
      },
    ],
    [form.control],
  );

  const exchangeColumns = React.useMemo<ColumnDef<ExchangeItemForm>[]>(
    () => [
      {
        accessorKey: "index",
        header: "",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => exchange.remove(row.index)}
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
            name={`exchanges.${row.index}.quantity`}
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
              name="exchanges"
            >
              {(value) => {
                return (
                  value.combination?.unit && (
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {value.combination?.unit}
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
          className: "w-100",
        },
        cell: ({ row }) => {
          return (
            <Controller
              name={`exchanges.${row.index}.combinationId`}
              control={form.control}
              render={({ field }) => {
                return (
                  <>
                    <FormItem>
                      <FormControl>
                        <ProductLookupInput
                          valueKey="combination"
                          ariaInvalid={Boolean(
                            form.formState.errors?.exchanges?.[row.index]
                              ?.combinationId,
                          )}
                          index={row.index}
                          disableNoQuantity
                          form={form}
                          {...field}
                          name="exchanges"
                          onChange={(value) => {
                            field.onChange(value.id);
                            form.setValue(
                              `exchanges.${row.index}.purchasePrice`,
                              value.price ?? 0,
                            );

                            form.setValue(
                              `exchanges.${row.index}.combination`,
                              value,
                            );

                            setTimeout(() => {
                              if (row.index + 1 === exchange.fields.length) {
                                const button: HTMLButtonElement | null =
                                  document.querySelector(".append-btn");
                                if (button) {
                                  button.focus();
                                }
                              } else {
                                form.setFocus(
                                  `exchanges.${row.index + 1}.quantity`,
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
        accessorKey: "purchasePrice",
        header: "Price",
        meta: {
          headerClassName: "text-center",
          className: "text-right",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`exchanges.${row.index}.purchasePrice`}
            render={() => (
              <FormItem
                className={cx({
                  "text-red-500 font-bold": Boolean(
                    form.formState.errors?.exchanges?.[row.index]
                      ?.purchasePrice,
                  ),
                })}
              >
                <FormControl>
                  <LineColumn
                    index={row.index}
                    control={form.control}
                    name="exchanges"
                  >
                    {(value) => formatCurrency(value.purchasePrice)}
                  </LineColumn>
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },

      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right w-20",
        },

        cell: ({ row }) => {
          const item = form.watch("exchanges") || [];
          const { quantity, purchasePrice } = item[row.index];
          return formatCurrency(quantity * Number(purchasePrice));
        },
      },
    ],
    [exchange, form],
  );
  return (
    <Modal
      size="lg"
      isOpen
      onOpenChange={onClose}
      title={salesOrder ? "Returns/Exchange" : "Supplier Returns"}
      description="Review the returns for this order"
    >
      <Form {...form}>
        <form
          className="flex gap-4 items-endx flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            console.log(form.getValues(), form.formState.errors);
            form
              .handleSubmit(handleReturn)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
        >
          <div className="max-h-[70vh] overflow-y-auto">
            <FormField
              control={form.control}
              name="returns"
              render={() => (
                <FormItem className="w-full">
                  <FormLabel>Returns</FormLabel>
                  <FormControl>
                    <DataTable
                      data={returnsFieldArray.fields}
                      columns={returnColumns}
                      renderFooter={() => {
                        const total = fieldReturns.reduce(
                          (acc, item) => {
                            const total =
                              acc.amount +
                                (Number(item.purchasePrice) -
                                  item.discount / item.quantity) *
                                  item.returnQuantity || 0;
                            return {
                              amount: total,
                            };
                          },
                          {
                            amount: 0,
                          },
                        );
                        return (
                          <>
                            <TableRow className="font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell colSpan={10} className="text-right">
                                {formatCurrency(total.amount)}
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
            {salesOrder && (
              <FormField
                control={form.control}
                name="exchanges"
                render={() => (
                  <FormItem className="w-full mb-4">
                    <FormLabel>Exchanges</FormLabel>

                    <FormControl>
                      <DataTable
                        data={exchange.fields}
                        columns={exchangeColumns}
                        renderFooter={() => {
                          const total = getTotalAmountTableFooter(
                            fieldExchanges || [],
                          );

                          return (
                            <>
                              <TableRow>
                                <TableCell colSpan={8}>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="shadow-sm append-btn"
                                    onClick={() =>
                                      exchange.append({
                                        quantity: 1,
                                        purchasePrice: 0,
                                        discount: 0,
                                        combinationId: -1,
                                      })
                                    }
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
            )}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter some internal notes..."
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

          <DialogFooter className="flex justify-between">
            <Button>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}

function AmountColumn<T extends FieldValues>({
  index,
  name,
  control,
}: {
  index: number;
  control: Control<T>;
  name: Path<T>;
}) {
  const [value, setValue] = React.useState(0);
  const quantity = useController({
    name: `${name}.${index}.quantity` as Path<T>,
    control,
  });
  const discount = useController({
    name: `${name}.${index}.discount` as Path<T>,
    control,
  });
  const purchasePrice = useController({
    name: `${name}.${index}.purchasePrice` as Path<T>,
    control,
  });

  const returnQuantity = useController({
    name: `${name}.${index}.returnQuantity` as Path<T>,
    control,
  });

  React.useEffect(() => {
    const q = Number(returnQuantity.field.value || 0);
    const p =
      Number(purchasePrice.field.value) -
      discount.field.value / quantity.field.value;

    const total = q * p;
    setValue(total);
  }, [
    discount.field.value,
    purchasePrice.field.value,
    quantity.field.value,
    returnQuantity.field.value,
  ]);

  return formatCurrency(value);
}
