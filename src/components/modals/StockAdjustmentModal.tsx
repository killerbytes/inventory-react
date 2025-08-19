import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  ERROR,
  STOCK_ADJUSTMENT_TYPE,
  STOCK_ADJUSTMENT_TYPE_OPTIONS,
  UNIT_COLOR,
} from "@/utils/definitions";
import {
  ApiErrorResponse,
  ProductCombinations,
  StockAdjustment,
} from "@/types";
import { getMappedProductComboName } from "@/lib/utils";
import { productCombinationServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockAdjustmentSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import { DialogFooter } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import NumberInput from "../NumberInput";
import ColorBadge from "../ColorBadge";
import { Button } from "../ui/button";
import React, { use } from "react";
import Select from "../Select";
import { toast } from "sonner";
import Modal from "../Modal";

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  combinationId,
  onSubmit,
}) {
  const [data, setData] = React.useState<ProductCombinations>();
  const form = useForm<StockAdjustment>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      combinationId,
    },
  });

  const getData = React.useCallback(async () => {
    try {
      const data = await productCombinationServices.get(combinationId);
      setData(data);
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.message);
    }
  }, []);

  React.useEffect(() => {
    getData();
  }, []);

  const handleSubmit = async (values: StockAdjustment) => {
    console.log(values);
    try {
      const res = await productCombinationServices.stockAdjustment(values);
      console.log(res);
      toast.success("Stock Adjustment successful");
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
        <div className="flex gap-2 font-semibold">
          {data && getMappedProductComboName(data.product, data.values)}{" "}
          <span className="text-primary">
            {data && data.inventory?.quantity}
          </span>
          <ColorBadge colorMap={UNIT_COLOR}>
            {String(data?.product?.unit)}
          </ColorBadge>
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
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log(form.getValues(), form.formState.errors);
                form
                  .handleSubmit(handleSubmit)(e)
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              }}
            >
              Submit Adjustment
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
