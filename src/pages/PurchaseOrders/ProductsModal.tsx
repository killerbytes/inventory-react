import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import validations from "@/schemas";
import * as z from "zod";

import { GlobalContext } from "@/components/GlobalContext";
import { DialogFooter } from "@/components/ui/dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import Autocomplete from "@/components/Autcomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productServices } from "@/services";
import type { Product } from "../Products";
import type { PurchaseOrderItem } from ".";
import React, { useContext } from "react";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [value, setValue] = React.useState("");
  const { store, fetchData } = useContext(GlobalContext) || {};
  const [products, setProducts] = React.useState<Product[]>([]);
  const { purchaseOrderItemSchema } = validations;
  const schema = purchaseOrderItemSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      unitPrice: 10,
      productId: 95,
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
        const { data } = await productServices.list();
        return data;
      });
    }
  }, [fetchData]);

  React.useEffect(() => {
    if (store?.products) {
      setProducts(store.products as Product[]);
    }
  }, [store?.products]);

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
                <FormItem className="flex flex-col">
                  <FormLabel>Product</FormLabel>
                  <Autocomplete
                    value={value}
                    items={items}
                    placeholder="Product"
                    onChange={(value) => {
                      form.setValue("productId", value.id);
                      setValue(value);
                    }}
                  />
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
            {/* <FormField
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
            /> */}

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
