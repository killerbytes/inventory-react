import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useToggle from "@/hooks/useToggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SupplierModal from "./SupplierModal";
import type { Supplier } from "../Suppliers";
import type { UseFormReturn } from "react-hook-form";
import SupplierPanel from "@/components/SupplierPanel";

export default function PurchaseOrderForm({
  form,
  supplier,
  onSupplierChange,
}: {
  form: UseFormReturn; // Replace 'any' with the actual form type if available
  supplier: Supplier | null;
  onSupplierChange: (supplier: Supplier) => void;
}) {
  const [toggle, handleToggle] = useToggle({
    addItemModal: false,
  });

  return (
    <>
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Input
                  {...field}
                  placeholder="Supplier"
                  className="w-full"
                  hidden
                />
                <div
                  className="flex gap-2 items-center group"
                  onClick={() => handleToggle({ supplierModal: true })}
                >
                  {supplier ? (
                    <SupplierPanel supplier={supplier} editable={true} />
                  ) : (
                    <Button type="button" variant="outline">
                      <Pencil size={16} className="" />
                      Select
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Order Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter some notes..."
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {toggle.supplierModal && (
        <SupplierModal
          isOpen={true}
          onClose={() => {
            handleToggle({ supplierModal: false });
          }}
          onSubmit={(value: Supplier) => {
            onSupplierChange(value);
            if (value.id !== undefined) {
              form.setValue("supplierId", value.id);
            }
          }}
        />
      )}
    </>
  );
}
