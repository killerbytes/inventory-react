import {
  ApiErrorResponse,
  CategorizedProductList,
  Customer,
  SalesOrderCreate,
  SalesOrderItem,
} from "@/types";
import PurchaseOrderItemForm, {
  AmountColumn,
  UnitColumn,
} from "../PurchaseOrders/Form/PurchaseOrderItemForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useCustomerStore } from "@/stores/customer.store";
import ProductCommand from "@/components/ProductCommand";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import NumberInput from "@/components/NumberInput";
import { salesOrderCreateSchema } from "@/schemas";
import DatePicker from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/definitions";
import { useNavigate } from "react-router";
import { useProductStore } from "@/stores";
import { randomInt } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import FullForm from "./FullForm";
import { toast } from "sonner";
import React from "react";

export default function Create() {
  const navigate = useNavigate();
  const { products, setProducts, flatProducts } = useProductStore();
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
          <CardTitle>Create Sales Order</CardTitle>
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
