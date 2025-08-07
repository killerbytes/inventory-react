import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ROUTES, UNIT_OPTIONS } from "@/utils/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import { productServices } from "@/services";
import { useNavigate } from "react-router";
import { ApiErrorResponse } from "@/types";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { z } from "zod";

export default function CloneToUnitModal({
  isOpen,
  onClose,
  productId,
}: {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}) {
  const navigate = useNavigate();
  const form = useForm<{ unit: string }>({
    resolver: zodResolver(
      z.object({ unit: z.string().min(1, { message: "Unit is required." }) }),
    ),
    defaultValues: {
      unit: "",
    },
  });

  const handleSubmit = async (values: { unit: string }) => {
    try {
      const product = await productServices.cloneToUnit(
        Number(productId),
        values,
      );
      onClose();
      navigate(`${ROUTES.PRODUCTS}/${product.id}/edit`);
    } catch (error) {
      const { errors, message } = getErrorMessage(error as ApiErrorResponse);
      console.log(errors, message);
      if (error.errors.find((e) => e.field === "products_name_unit")) {
        toast.error("Product with the same unit already exists");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Clone to Unit"
      description="Clone product to another unit. eg: BOX to PCS"
    >
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Unit</FormLabel>
                <Select {...field} options={UNIT_OPTIONS} />

                <FormMessage />
              </FormItem>
            )}
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
