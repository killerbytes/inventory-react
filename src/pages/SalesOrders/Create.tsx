import {
  ApiErrorResponse,
  CategorizedProductList,
  Customer,
  SalesOrderCreate,
} from "@/types";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  customerServices,
  productServices,
  salesOrderServices,
} from "@/services";
import { useCustomerStore, useProductStore } from "@/stores";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { salesOrderCreateSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/definitions";
import { useNavigate } from "react-router";
import { randomInt } from "@/lib/utils";
import FullForm from "./FullForm";
import { toast } from "sonner";
import React from "react";

export default function Create() {
  const navigate = useNavigate();
  const { setProducts } = useProductStore();
  const { customers, setCustomers } = useCustomerStore();

  const form = useForm<SalesOrderCreate>({
    resolver: zodResolver(salesOrderCreateSchema),
    defaultValues: {
      salesOrderNumber: randomInt(1000000, 9999999).toString(),
      // orderDate: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),
      customerId: 1,
      salesOrderItems: [
        {
          // combinationId: 1,
          quantity: 1,
          purchasePrice: 0,
          discount: null,
        },
      ],
    },
  });

  React.useEffect(() => {
    const getData = async () => {
      const data: CategorizedProductList[] = await productServices.list();
      setProducts(data);
    };
    getData();
  }, [setProducts]);

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
      toast.error(`Submission failed, ${apiError.message}`);
    }
  }

  const formData = useWatch({ control: form.control });

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
        <CardContent>
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

      {JSON.stringify(formData, null, 2)}
    </>
  );
}
