import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ERROR, UNIT_COLOR, UNIT_OPTIONS } from "@/utils/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { ApiErrorResponse, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { productServices } from "@/services";
import { useForm } from "react-hook-form";
import { SelectItem } from "../ui/select";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import ColorBadge from "../ColorBadge";
import { toast } from "sonner";
import { z } from "zod";

type CloneToUnitModalProps = { unit: string; products_name_unit?: string };

export default function CloneToUnitModal({
  isOpen,
  onSubmit,
  onClose,
  productId,
}: {
  isOpen: boolean;
  onSubmit: (product: Product) => Promise<void>;
  onClose: () => void;
  productId: number;
  redirect?: boolean;
}) {
  const form = useForm<CloneToUnitModalProps>({
    resolver: zodResolver(
      z.object({
        unit: z.string().min(1, { message: "Unit is required." }),
        products_name_unit: z.string().optional(),
      }),
    ),
    defaultValues: {
      unit: "",
    },
  });

  const handleSubmit = async (values: CloneToUnitModalProps) => {
    try {
      const product = await productServices.cloneToUnit(
        Number(productId),
        values,
      );
      onSubmit(product);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof typeof values, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Clone to Unit"
      description="Clone product to another unit. eg: BOX to PCS"
      className="!max-w-[400px]"
    >
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Unit</FormLabel>
                <Select
                  {...field}
                  options={UNIT_OPTIONS}
                  renderOption={(option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      <ColorBadge colorMap={UNIT_COLOR}>
                        {String(option.label)}
                      </ColorBadge>
                    </SelectItem>
                  )}
                />

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="products_name_unit"
            render={() => <FormMessage />}
          />
        </form>
        <DialogFooter>
          <Button
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
            Clone to Unit
          </Button>
        </DialogFooter>
      </Form>
    </Modal>
  );
}
