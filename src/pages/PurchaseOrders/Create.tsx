import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { purchaseOrderServices } from "@/services";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ERROR, MODE_OF_PAYMENT_OPTIONS, ROUTES } from "@/utils/definitions";
import { purchaseOrderCreateSchema, purchaseOrderSchema } from "@/schemas";
import { ApiError, ApiErrorResponse, PurchaseOrderCreate } from "@/types";
import PendingOrderForm from "./Form/PendingOrderForm";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/useDebounce";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router";
import { randomInt } from "@/lib/utils";
import { addWeeks } from "date-fns";
import { toast } from "sonner";
import React from "react";
import * as z from "zod";

const purchaseOrderItemDefault = {
  combinationId: null,
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

  const form = useForm<PurchaseOrderCreate>({
    resolver: zodResolver(purchaseOrderCreateSchema),
    defaultValues,
  });

  const data = useWatch({ control: form.control, name: "purchaseOrderItems" });

  async function onSubmit(values: PurchaseOrderCreate) {
    try {
      await purchaseOrderServices.create(values);
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
      );
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err: ApiError) => {
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
      } else {
        toast.error("Submission failed: " + apiError.message);
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
        <Card>
          <CardHeader>
            <CardTitle>Create Purchase Order</CardTitle>
            <CardAction></CardAction>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <PendingOrderForm form={form} />
              <div className="flex justify-end mt-auto">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const { purchaseOrderItems, ...rest } = form.getValues();
                    const valid = purchaseOrderItems.filter(
                      (item) => item.combinationId,
                    );
                    console.log(form.getValues(), form.formState.errors);
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
          </CardContent>
        </Card>
      </div>
      {JSON.stringify(data)}
    </>
  );
}
