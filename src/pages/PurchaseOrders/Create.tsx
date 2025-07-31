import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { purchaseOrderServices } from "@/services";

import { MODE_OF_PAYMENT_OPTIONS, ROUTES } from "@/utils/definitions";
import { ApiError, ApiErrorResponse, PurchaseOrder } from "@/types";
import { getErrorMessage, randomInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import useDebounce from "@/hooks/useDebounce";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router";
import OrderForm from "./Form/OrderForm";
import { MoveLeft } from "lucide-react";
import { addWeeks } from "date-fns";
import { toast } from "sonner";
import React from "react";
import * as z from "zod";

const purchaseOrderItemDefault = {
  productId: null,
  unitPrice: 0,
  quantity: 1,
  discount: null,
  discountNote: "",
};

const purchaseOrderDefault = {
  purchaseOrderNumber: randomInt(1000000, 9999999).toString(),
  supplierId: randomInt(1, 100),
  modeOfPayment: MODE_OF_PAYMENT_OPTIONS[randomInt(0, 1)].value,
  orderDate: new Date().toISOString(),
  deliveryDate: new Date().toISOString(),
  checkNumber: "",
  dueDate: addWeeks(new Date(), 1).toISOString(),
  purchaseOrderItems: Array.from({ length: 3 }, () => purchaseOrderItemDefault),
};

export default function Create() {
  const navigate = useNavigate();

  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
  )
    ? JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        ) as string,
      )
    : purchaseOrderDefault;

  const form = useForm<PurchaseOrder>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues,
  });

  const data = useWatch({ control: form.control, name: "purchaseOrderItems" });

  async function onSubmit(values: PurchaseOrder) {
    try {
      await purchaseOrderServices.create(values);
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
      );
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      const { errors } = getErrorMessage(error as ApiErrorResponse);
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(
            err.field as keyof z.infer<typeof purchaseOrderSchema>,
            {
              type: "server",
              message: err.message,
            },
          );
        }
      });
      if (errors.length === 1) {
        toast.error(errors[0].message);
      } else {
        toast.error("Submission failed");
      }
    }
  }

  const saveDraft = React.useCallback(() => {
    const draft =
      JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        ) as string,
      ) || {};
    const newDraft = { ...form.getValues() };

    if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
      localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v)),
      );
    }
  }, [form]);
  const formData = useWatch({ control: form.control });

  const debouncedFormData = useDebounce(formData, 1000);

  React.useEffect(() => {
    saveDraft();
  }, [debouncedFormData, saveDraft]);
  return (
    <>
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
          className="mb-4"
        >
          <MoveLeft /> Back
        </Button>
      </div>
      <h2 className="mb-4">Create Purchase Order</h2>
      <Form {...form}>
        <OrderForm form={form} />

        <div className="flex justify-end mt-auto mb-10">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const { purchaseOrderItems, ...rest } = form.getValues();
              const valid = purchaseOrderItems.filter((item) => item.productId);
              console.log(form.formState.errors);
              form.reset({
                ...rest,
                purchaseOrderItems: valid.length
                  ? valid
                  : [purchaseOrderItemDefault],
              });
              form
                .handleSubmit(onSubmit)(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
          >
            Create Order
          </Button>
        </div>
      </Form>
      {JSON.stringify(data)}
    </>
  );
}
