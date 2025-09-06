import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ERROR,
  INVOICE_STATUS,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { Ban, EllipsisVertical, Save, Trash2 } from "lucide-react";
import { ApiErrorResponse, Invoice, InvoiceLine } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { invoiceServices } from "@/services";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { invoiceSchema } from "@/schemas";
import Loader from "@/components/Loader";
import PaymentTab from "./PaymentTab";
import { toast } from "sonner";
import Static from "./Static";
import Draft from "./Draft";
import React from "react";

export default function Details() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState();
  const { toggle, handleToggle } = useToggle({
    cancelModal: false,
    dropdownMenu: false,
  });
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
  });

  React.useEffect(() => {
    form.reset(data);
  }, [data]);

  const getData = async (id: number) => {
    try {
      const data = await invoiceServices.get(id);
      const invoiceLines = data.invoiceLines.map((item: InvoiceLine) => ({
        ...item.goodReceipt,
      }));
      setData({
        ...data,
        invoiceLines,
      });
      // form.reset({ ...data, invoiceLines });
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.NOT_FOUND) {
        navigate(ROUTES.INVOICES);
      }
      toast.error("Server Error - " + apiError.message);
    }
  };

  React.useEffect(() => {
    getData(Number(id));
  }, [id]);

  const onDeleteOrder = async () => {
    await invoiceServices.delete(Number(id));
    navigate(ROUTES.INVOICES);
  };
  const onSave = async (values: Invoice) => {
    try {
      setLoading(true);
      await invoiceServices.update(Number(id), values);
      toast.success(`Invoice saved successfully`);
      await getData(Number(id));
      setLoading(false);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  };

  const onSubmit = async (values: Invoice) => {
    try {
      await invoiceServices.update(Number(id), {
        ...values,
        status: INVOICE_STATUS.POSTED,
      });
      toast.success(`Invoice saved successfully`);
      navigate(ROUTES.INVOICES);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed - " + apiError.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Invoice Details
          </CardTitle>
          <CardAction className="flex gap-2">
            <ColorBadge colorMap={STATUS_COLOR}>
              {String(data?.status)}
            </ColorBadge>
            <DropdownMenu open={toggle.dropdownMenu}>
              <DropdownMenuTrigger
                asChild
                onClick={() => handleToggle({ dropdownMenu: true })}
              >
                <Button variant="outline" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {data?.status !== INVOICE_STATUS.DRAFT && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleToggle({ cancelModal: true, dropdownMenu: false });
                    }}
                  >
                    <Ban color="red" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
                {data?.status === INVOICE_STATUS.DRAFT && (
                  <>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        const { invoiceLines } = form.getValues();
                        console.log(invoiceLines);
                        form.setValue(
                          "invoiceLines",
                          invoiceLines.map((item) => ({
                            goodReceiptId: item.id,
                            amount: Number(item.totalAmount),
                          })),
                        );

                        console.log(form.formState.errors);
                        form
                          .handleSubmit(onSave)(e)
                          .catch((error) => {
                            console.error("Form submission error:", error);
                          });

                        handleToggle({
                          dropdownMenu: false,
                        });
                      }}
                    >
                      <Save color="green" />
                      Save
                    </DropdownMenuItem>
                    <ConfirmDialog
                      title={`Void order`}
                      onConfirm={onDeleteOrder}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 color="red" />
                        Void
                      </DropdownMenuItem>
                    </ConfirmDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs defaultValue="invoice">
            <TabsList>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="invoice">
              {data?.status === INVOICE_STATUS.DRAFT ? (
                <Draft form={form} onSubmit={onSubmit} />
              ) : (
                <Static data={data} />
              )}
            </TabsContent>
            <TabsContent value="payments">
              <PaymentTab data={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Loader isLoading={loading} />
    </div>
  );
}
