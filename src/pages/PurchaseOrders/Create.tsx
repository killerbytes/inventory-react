import {
  PurchaseOrder,
  purchaseOrderServices,
  type ApiError,
} from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { MODE_OF_PAYMENT_OPTIONS, ROUTES } from "@/utils/definitions";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import useDebounce from "@/hooks/useDebounce";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router";
import { MoveLeft } from "lucide-react";
import { addWeeks } from "date-fns";
import { toast } from "sonner";
import React from "react";
import * as z from "zod";

const purchaseOrderItemDefault = {
  quantity: 1,
  discountNote: "",
};

const purchaseOrderDefault = {
  purchaseOrderNumber: "123123123",
  supplierId: 1,
  modeOfPayment: MODE_OF_PAYMENT_OPTIONS[1].value,
  orderDate: new Date().toISOString(),
  deliveryDate: new Date().toISOString(),
  checkNumber: "",
  dueDate: addWeeks(new Date(), 1).toISOString(),
  purchaseOrderItems: Array.from({ length: 5 }, () => purchaseOrderItemDefault),
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

  async function onSubmit(values: PurchaseOrder) {
    try {
      await purchaseOrderServices.create(values);
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
      );
      navigate(ROUTES.PURCHASE_ORDERS);
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
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

  // async function onSaveDraft() {
  //   try {
  //     console.log(form.getValues());
  //   } catch (error) {
  //     toast.error("Submission failed");
  //   }
  // }

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

  const debouncedFormData = useDebounce(formData, 500);

  React.useEffect(() => {
    // saveDraft();
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
        <PurchaseOrderForm form={form} />

        <div className="flex justify-end mt-auto mb-10">
          <Button
            // className={"rounded-r-none"}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const { purchaseOrderItems, ...rest } = form.getValues();

              form.reset({
                ...rest,
                purchaseOrderItems: purchaseOrderItems.filter(
                  (item) => item.productId,
                ),
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
    </>
  );
}
