import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiErrorResponse, Customer, SalesOrderCreate } from "@/types";
import { customerServices, salesOrderServices } from "@/services";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERROR, ROUTES } from "@/utils/definitions";
import { useForm, useWatch } from "react-hook-form";
import { salesOrderCreateSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useCustomerStore } from "@/stores";
import { useNavigate } from "react-router";
import FullForm from "./FullForm";
import { toast } from "sonner";
import React from "react";
const salesOrderItemDefault = {
  discountNote: "",
};
export default function Create() {
  const navigate = useNavigate();
  const { customers, setCustomers } = useCustomerStore();

  const form = useForm<SalesOrderCreate>({
    resolver: zodResolver(salesOrderCreateSchema),
    defaultValues: {
      deliveryDate: new Date().toISOString(),
      customerId: 1,
      modeOfPayment: "CASH",
      salesOrderItems: Array.from({ length: 3 }, () => salesOrderItemDefault),
    },
  });

  React.useEffect(() => {
    const getData = async () => {
      const data: Customer[] = await customerServices.list();
      setCustomers(data);
    };
    if (customers.length === 0) {
      getData();
    }
  }, [customers.length, setCustomers]);

  async function onSubmit(values: SalesOrderCreate) {
    try {
      await salesOrderServices.create(values);
      toast.success(`Sales Order created successfully`);
      navigate(ROUTES.SALES_ORDERS);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof SalesOrderCreate, {
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

  // const formData = useWatch({ control: form.control });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Create Sales Order
          </CardTitle>
          <CardAction></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FullForm form={form} />
          <div className="flex justify-end">
            <Button
              className="ml-auto"
              onClick={(e) => {
                e.preventDefault();
                console.log(form.getValues(), form.formState.errors);
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
          </div>
        </CardContent>
      </Card>

      {/* {JSON.stringify(formData, null, 2)} */}
    </>
  );
}
