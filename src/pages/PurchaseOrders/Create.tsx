import React, { useCallback } from "react";
import { MoveLeft } from "lucide-react";
import * as z from "zod";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services, { type ApiError } from "@/services";
import validations from "@/utils/validations";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Supplier } from "../Suppliers";
import useDebounce from "@/hooks/useDebounce";
import { ROUTES } from "@/utils/definitions";
import { useNavigate } from "react-router";
import type { PurchaseOrderItem } from ".";
import PurchaseOrderForm from "./PurchaseOrderForm";
import ProductsTable from "./ProductsTable";

export default function Create() {
  const navigate = useNavigate();
  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_DRAFT`
  )
    ? JSON.parse(
        localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_DRAFT`) as string
      )
    : {
        orderDate: new Date().toISOString(),
        deliveryDate: new Date().toISOString(),
      };

  const [items, setItems] = React.useState<PurchaseOrderItem[]>(
    defaultValues.items || []
  );
  const [supplier, setSupplier] = React.useState<Supplier>(
    defaultValues.supplier || null
  );
  const { purchaseOrderSchema } = validations;

  const form = useForm<z.infer<typeof purchaseOrderSchema>>({
    resolver: zodResolver(purchaseOrderSchema),

    defaultValues,
  });

  const formData = useWatch({ control: form.control });

  const debouncedFormData = useDebounce(formData, 500);

  async function onSubmit(values: z.infer<typeof purchaseOrderSchema>) {
    try {
      await services.purchaseOrderServices.create({
        ...values,
        purchaseOrderItems: items,
      });
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(`${import.meta.env.VITE_APP_NAME}_DRAFT`);
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
            }
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

  const saveDraft = useCallback(() => {
    const draft =
      JSON.parse(
        localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_DRAFT`) as string
      ) || {};
    const newDraft = { ...form.getValues(), supplier, items };

    if (JSON.stringify(draft) !== JSON.stringify(newDraft)) {
      console.log("saving...", draft, newDraft);
      localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_DRAFT`,
        JSON.stringify(newDraft, (k, v) => (v === undefined ? null : v))
      );
    }
  }, [form, items, supplier]);

  React.useEffect(() => {
    saveDraft();
  }, [debouncedFormData, items, supplier, saveDraft]);

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
        className="mb-4"
      >
        <MoveLeft /> Back
      </Button>
      <h2 className="mb-4">Create Purchase Order</h2>
      <div className="mb-12">
        <PurchaseOrderForm
          form={form}
          supplier={supplier}
          onSupplierChange={setSupplier}
        />
      </div>
      <ProductsTable items={items} setItems={setItems} />
      <DialogFooter>
        <Button
          onClick={(e) => {
            e.preventDefault();
            console.log(form.formState.errors);
            form
              .handleSubmit(onSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
          type="button"
        >
          Create Order
        </Button>
      </DialogFooter>
    </div>
  );
}
