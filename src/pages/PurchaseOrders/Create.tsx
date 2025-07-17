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
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router";
import { MoveLeft } from "lucide-react";
import validations from "@/schemas";
import { addWeeks } from "date-fns";
import { toast } from "sonner";
import * as z from "zod";

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
    : {
        purchaseOrderNumber: "",
        modeOfPayment: MODE_OF_PAYMENT_OPTIONS[1].value,
        orderDate: new Date().toISOString(),
        deliveryDate: new Date().toISOString(),
        checkNumber: "",
        dueDate: addWeeks(new Date(), 1).toISOString(),
        purchaseOrderItems: [],
      };

  const { purchaseOrderSchema } = validations;

  const form = useForm<PurchaseOrder>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues,
  });

  async function onSubmit(values: PurchaseOrder) {
    try {
      const { supplier, ...rest } = values;
      await purchaseOrderServices.create(rest);
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
        <PurchaseOrderForm form={form} onSubmit={onSubmit} isCreate />
      </Form>
    </>
  );
}
