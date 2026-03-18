import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateStockAdjustment,
  useProductCombination,
} from "../hooks/useProductCombination";
import {
  ERROR,
  STOCK_ADJUSTMENT_TYPE_OPTIONS,
  UNIT_COLOR,
} from "@/utils/definitions";
import {
  ApiErrorResponse,
  StockAdjustment,
  stockAdjustmentSchema,
} from "@/schemas";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import NumberInput from "@/components/NumberInput";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import { toast } from "sonner";
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
  const { data, isError, error } = useProductCombination(combinationId);
  const {
    mutate: createStockAdjustment,
    isPending: createStockAdjustmentPending,
  } = useCreateStockAdjustment();

  const form = useForm<StockAdjustment>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      combinationId,
      newQuantity: 0,
    },
  });

  if (isError) {
    const apiError = error as unknown as ApiErrorResponse;
    toast.error(apiError.message);
  }

  React.useEffect(() => {
    if (data) {
      form.setValue("newQuantity", data.inventory?.quantity);
    }
  }, [data]);

  const handleSubmit = async (values: StockAdjustment) => {
    if (!data) return;
    createStockAdjustment(
      { values },
      {
        onSuccess: () => {
          toast.success("Stock Adjustment successful");
          onClose();
        },
        onError: (error: unknown) => {
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
        },
      },
    );
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
              {data && Number(data.inventory?.quantity)}
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
              isLoading={createStockAdjustmentPending}
              title="Stock Adjustment"
              onConfirm={async (e) => {
                e.preventDefault();
                await form
                  .handleSubmit(handleSubmit)(e)
                  .catch((error) => {
                    const apiError = error as ApiErrorResponse;
                    console.error("Form submission error:", apiError.message);
                  });
              }}
            >
              <Button
                type="button"
                className="shadow-sm"
                disabled={createStockAdjustmentPending}
              >
                {createStockAdjustmentPending && (
                  <Loader2Icon className="animate-spin" />
                )}
                Submit Adjustment
              </Button>
            </ConfirmDialog>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
