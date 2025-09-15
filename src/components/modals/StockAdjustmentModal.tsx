import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  ERROR,
  STOCK_ADJUSTMENT_TYPE_OPTIONS,
  UNIT_COLOR,
} from "@/utils/definitions";
import {
  ApiErrorResponse,
  ProductCombinations,
  StockAdjustment,
} from "@/types";
import { productCombinationServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockAdjustmentSchema } from "@/schemas";
import ConfirmDialog from "../ConfirmDialog";
import { DialogFooter } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import NumberInput from "../NumberInput";
import ColorBadge from "../ColorBadge";
import { Button } from "../ui/button";
import Select from "../Select";
import { toast } from "sonner";
import Modal from "../Modal";
import React from "react";

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  combinationId,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  combinationId: number;
  onSubmit: (values: StockAdjustment) => Promise<void>;
}) {
  const [data, setData] = React.useState<ProductCombinations>();
  const form = useForm<StockAdjustment>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      combinationId,
      newQuantity: 0,
    },
  });

  const getData = React.useCallback(async () => {
    try {
      const data = await productCombinationServices.get(combinationId);
      setData(data);
      form.setValue("newQuantity", data.inventory?.quantity);
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.message);
    }
  }, []);

  React.useEffect(() => {
    getData();
  }, []);

  const handleSubmit = async (values: StockAdjustment) => {
    try {
      await productCombinationServices.stockAdjustment(values);
      toast.success("Stock Adjustment successful");
      onClose();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof StockAdjustment, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Stock Adjustment failed: " + apiError.message);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} title="Stock Adjustment">
      <div className="flex flex-col gap-2">
        <div className="flex font-semibold items-center justify-between">
          <div className="flex gap-2">
            {data?.name}
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(data?.product?.baseUnit)}
            </ColorBadge>
          </div>
          <div className="flex gap-2">
            Stock:
            <span className="text-primary">
              {data && data.inventory?.quantity}
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(form.formState.errors);
            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
        >
          <FormField
            control={form.control}
            name="newQuantity"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>New Quantity</FormLabel>
                <NumberInput {...field} type="number" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    options={Object.values(STOCK_ADJUSTMENT_TYPE_OPTIONS)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Notes</FormLabel>
                <Textarea {...field} value={String(field.value ?? "")} />
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <ConfirmDialog
              title="Stock Adjustment"
              onConfirm={(e) => {
                e.preventDefault();
                form
                  .handleSubmit(handleSubmit)(e)
                  .catch((error) => {
                    const apiError = error as ApiErrorResponse;
                    console.error("Form submission error:", apiError.message);
                  });
              }}
            >
              <Button type="button" className="shadow-sm">
                Submit Adjustment
              </Button>
            </ConfirmDialog>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
