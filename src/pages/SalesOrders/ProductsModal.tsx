import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import validations from "@/utils/validations";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services from "@/services";
import type { Product } from "../Products";
import React, { useContext } from "react";
import { GlobalContext } from "@/components/GlobalContext";
import type { PurchaseOrderItem } from ".";

export default function ProductsModal({
  isOpen,
  onClose,
  onAdd,
  exclude,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: PurchaseOrderItem) => void;
  exclude?: Array<number>;
}) {
  const { store, fetchData } = useContext(GlobalContext) || {};
  const [inventorys, setProducts] = React.useState<Product[]>([]);
  const { salesOrderItemSchema } = validations;
  const schema = salesOrderItemSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      unitPrice: 10,
    },
  });

  const items = exclude
    ? inventorys.filter((p) => !exclude?.includes(p.id))
    : inventorys;

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const item: PurchaseOrderItem = {
        ...values,
        inventory: inventorys.find(
          (p) => p.id === values.inventoryId
        ) as Product,
      } as PurchaseOrderItem;

      onAdd(item);
      toast.success(`Added: ${item.inventory.product.name} x ${item.quantity}`);
      form.reset();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Submission failed");
    }
  }

  const getData = async () => {
    const { data } = await services.inventoryServices.list();
    setProducts(data);
  };

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    if (store?.inventorys) {
      setProducts(store.inventorys as Product[]);
    }
  }, [store?.inventorys]);

  // form.setValue("inventoryId", items[0]?.id);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Add Product"
        description="Add a inventory to the purchase order"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log(form.formState.errors);
              e.preventDefault();
              form
                .handleSubmit(onSubmit)(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="inventoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={String(item.id)}
                          disabled={item.quantity === 0}
                        >
                          {item.product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
