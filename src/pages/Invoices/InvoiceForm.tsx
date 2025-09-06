import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useController, useFieldArray } from "react-hook-form";
import GoodReceiptPickerModal from "./GoodReceiptPickerModal";
import { TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Autocomplete from "@/components/Autcomplete";
import { DataTable } from "@/components/DataTable";
import { STATUS_COLOR } from "@/utils/definitions";
import { ColumnDef } from "@tanstack/react-table";
import InvoiceLineTable from "./InvoiceLineTable";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { GoodReceipt, Invoice } from "@/types";
import { Input } from "@/components/ui/input";
import { supplierServices } from "@/services";
import { useSupplierStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import { Plus } from "lucide-react";
import React from "react";

export default function InvoiceForm({ form }) {
  const { suppliers, setSuppliers } = useSupplierStore();
  const supplier = useController({
    name: "supplierId",
    control: form.control,
  });

  const { toggle, handleToggle } = useToggle({
    goodReceiptPickerModal: false,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "invoiceLines",
    keyName: "fieldId",
  });

  React.useEffect(() => {
    const getData = async () => {
      const data: Supplier[] = await supplierServices.list();
      setSuppliers(data);
    };
    if (suppliers.length === 0) {
      getData();
    }
  }, [setSuppliers, suppliers.length]);

  const onPickerSubmit = (selected: GoodReceipt[]) => {
    handleToggle({ goodReceiptPickerModal: false });
    form.setValue("invoiceLines", selected);
  };

  return (
    <>
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Supplier</FormLabel>
              <Autocomplete
                value={
                  suppliers.find((supplier) => supplier.id === field.value)
                    ?.name
                }
                options={suppliers}
                placeholder="Supplier"
                onChange={(value) => {
                  form.setValue("supplierId", Number(value.id), {
                    shouldValidate: true,
                  });
                }}
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="invoiceNumber"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/2">
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input placeholder="Invoice No." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="invoiceDate"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/2">
              <FormLabel>Invoice Date</FormLabel>
              <FormControl>
                <DatePicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/2">
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <DatePicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <Button
          className="shadow-sm"
          type="button"
          size="sm"
          onClick={() => handleToggle({ goodReceiptPickerModal: true })}
        >
          <Plus />
        </Button>
      </div>

      <FormField
        control={form.control}
        name="invoiceLines"
        render={() => (
          <FormItem className="w-full">
            <FormControl>
              <ScrollArea
                className="max-h-[280px]  rounded-md border"
                tabIndex={-1}
                autoFocus={false}
              >
                <InvoiceLineTable data={fields} form={form} />
              </ScrollArea>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {toggle.goodReceiptPickerModal && (
        <GoodReceiptPickerModal
          isOpen={true}
          onClose={() => handleToggle({ goodReceiptPickerModal: false })}
          supplierId={Number(supplier.field.value)}
          onSubmit={(selected) => {
            onPickerSubmit(selected);
          }}
          defaultSelected={fields}
        />
      )}
    </>
  );
}
