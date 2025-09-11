import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { goodReceiptServices } from "@/services";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiError,
  ApiErrorResponse,
  GoodReceipt,
  GoodReceiptCreate,
} from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ERROR, ROUTES } from "@/utils/definitions";
import { goodReceiptCreateSchema } from "@/schemas";
import PendingOrderForm from "./Form/PendingForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import React from "react";

const goodReceiptItemDefault = {
  discountNote: "",
};

const goodReceiptDefault = {
  // goodReceiptNumber: randomInt(1000000, 9999999).toString(),
  // supplierId: randomInt(1, 100),
  // modeOfPayment: MODE_OF_PAYMENT_OPTIONS[randomInt(0, 1)].value,
  receiptDate: new Date().toISOString(),
  // dueDate: addWeeks(new Date(), 1).toISOString(),
  goodReceiptLines: Array.from({ length: 3 }, () => goodReceiptItemDefault),
};

export default function Create() {
  const navigate = useNavigate();
  const [json, setJson] = React.useState(null);

  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
  )
    ? JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        ) as string,
      )
    : goodReceiptDefault;

  const form = useForm<GoodReceiptCreate>({
    resolver: zodResolver(goodReceiptCreateSchema),
    defaultValues,
  });

  // const data = useWatch({ control: form.control, name: "goodReceiptLines" });
  React.useEffect(() => {
    setTimeout(() => {
      form.setFocus("supplierId");
    });
  }, [form]);

  async function onSubmit(values: GoodReceiptCreate) {
    try {
      await goodReceiptServices.create(values as GoodReceipt);
      toast.success(`Purchase Order created successfully`);
      localStorage.removeItem(
        `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
      );
      navigate(ROUTES.GOOD_RECEIPT);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err: ApiError) => {
          if (err.field) {
            console.log(err.field);
            form.setError(err.field as keyof GoodReceiptCreate, {
              type: "server",
              message: err.message,
            });
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

  React.useEffect(() => {
    if (json) {
      const data = JSON.parse(json);

      form.setValue(
        "goodReceiptLines",
        data.map((item) => {
          return {
            quantity: item.QTY,
            purchasePrice: item.Price,
            discount: item.Discount,
            discountNote: item.Net === "Net" ? null : item.Net,
          };
        }),
      );
    }
  }, [form, json]);

  return (
    <>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="bg-border h-5 w-[1px]"></div>
              Create Good Receipt
            </CardTitle>
            <CardAction>
              <Input
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setJson(e.currentTarget.value);
                  }
                }}
                placeholder="Paste JSON here..."
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <PendingOrderForm form={form} />
            <div className="flex justify-end mt-auto">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const { goodReceiptLines, ...rest } = form.getValues();
                  const valid = goodReceiptLines.filter(
                    (item) =>
                      item.combinationId || item.quantity || item.purchasePrice,
                  );
                  console.log(form.getValues(), form.formState.errors);
                  // form.reset({
                  //   ...rest,
                  //   goodReceiptLines: valid.length
                  //     ? valid
                  //     : [goodReceiptItemDefault],
                  // });
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
          </CardContent>
        </Card>
      </div>
      {/* {JSON.stringify(data)} */}
    </>
  );
}
