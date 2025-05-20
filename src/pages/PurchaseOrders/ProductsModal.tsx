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
  const [products, setProducts] = React.useState<Product[]>([]);
  const { purchaseOrderItemSchema } = validations;
  const schema = purchaseOrderItemSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      unitPrice: 10,
    },
  });

  const items = exclude
    ? products.filter((p) => !exclude?.includes(p.id))
    : products;

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const item: PurchaseOrderItem = {
        ...values,
        product: products.find((p) => p.id === values.productId) as Product,
      } as PurchaseOrderItem;

      onAdd(item);
      toast.success(`Added: ${item.product.name} x ${item.quantity}`);
      form.reset();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Submission failed");
    }
  }

  React.useEffect(() => {
    if (fetchData) {
      fetchData("products", async () => {
        const { data } = await services.productServices.list();
        return data;
      });
    }
  }, [fetchData]);

  React.useEffect(() => {
    if (store?.products) {
      setProducts(store.products as Product[]);
    }
  }, [store?.products]);

  React.useEffect(() => {
    if (items.length === 0) return;
    setTimeout(() => {
      form.setValue("productId", items[0]?.id);
    });
  }, [form, items]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Add Product"
        description="Add a product to the purchase order"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
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
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      console.log("changing", form.getValues(), field);
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name}
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
