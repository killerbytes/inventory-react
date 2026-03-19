import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
  ApiError,
  ApiErrorResponse,
  goodReceiptBaseSchema,
  GoodReceiptForm,
  GoodReceiptInput,
} from "@/schemas";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PendingOrderForm from "../../features/good-receipts/components/Form/PendingForm";
import { useCreateGoodReceipt } from "@/features/good-receipts/hooks/useGoodReceipts";
import { ERROR, goodReceiptItemDefault, ROUTES } from "@/utils/definitions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import React from "react";

const goodReceiptDefault = {
  referenceNo: "",
  receiptDate: new Date().toISOString(),
  goodReceiptLines: Array.from({ length: 3 }, () => goodReceiptItemDefault),
  supplierId: -1,
  internalNotes: "",
};

export default function Create() {
  const { mutate: createGoodReceipt } = useCreateGoodReceipt();
  const navigate = useNavigate();
  const [json, setJson] = React.useState<string | null>(null);

  const defaultValues = localStorage.getItem(
    `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
  )
    ? JSON.parse(
        localStorage.getItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        ) as string,
      )
    : goodReceiptDefault;

  const form = useForm<GoodReceiptForm>({
    resolver: zodResolver(goodReceiptBaseSchema),
    defaultValues,
  });

  React.useEffect(() => {
    setTimeout(() => {
      form.setFocus("supplierId");
    });
  }, [form]);

  async function onSubmit(values: GoodReceiptInput) {
    createGoodReceipt(values, {
      onSuccess: () => {
        toast.success(`Purchase Order created successfully`);
        localStorage.removeItem(
          `${import.meta.env.VITE_APP_NAME}_PURCHASE_DRAFT`,
        );
        navigate(ROUTES.GOOD_RECEIPT);
      },
      onError: (error: unknown) => {
        const apiError = error as ApiErrorResponse;
        if (apiError.code === ERROR.VALIDATION_ERROR) {
          apiError.errors?.forEach((err: ApiError) => {
            if (err.field) {
              console.log(err.field);
              form.setError(err.field as keyof GoodReceiptInput, {
                type: "server",
                message: err.message,
              });
            }
          });
        } else {
          toast.error("Submission failed: " + apiError.message);
        }
      },
    });
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
        JSON.stringify(newDraft, (_, v) => (v === undefined ? null : v)),
      );
    }
  }, [form]);
  const formData = useWatch({ control: form.control });

  const debouncedFormData = useDebounce(formData, 1000);

  React.useEffect(() => {
    if (form.formState.isDirty) {
      saveDraft();
    }
  }, [form, debouncedFormData, saveDraft]);

  React.useEffect(() => {
    if (json) {
      const data = JSON.parse(json);

      form.setValue(
        "goodReceiptLines",
        data.map(
          (item: {
            quantity: number;
            price: number;
            discount: number;
            discountNote: string;
          }) => {
            return {
              quantity: item.quantity,
              purchasePrice: item.price,
              discount: item.discount,
              discountNote: item.discountNote,
            };
          },
        ),
      );
    }
  }, [form, json]);

  return (
    <>
      <div>
        <Card>
          <CardHeader className="px-2 md:px-4">
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
          <CardContent className="flex flex-col gap-4 px-2 md:px-4">
            <PendingOrderForm form={form} />
            <div className="flex justify-end mt-auto">
              <Button
                className="bg-orange-500"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(form.getValues(), form.formState.errors);

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
