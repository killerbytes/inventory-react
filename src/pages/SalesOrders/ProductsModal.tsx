import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import validations from "@/schemas";
import * as z from "zod";

import {
  inventoryServices,
  type Inventory,
  type SalesOrderItem,
} from "@/services";
import { GlobalContext } from "@/components/GlobalContext";
import { DialogFooter } from "@/components/ui/dialog";
import Autocomplete from "@/components/Autcomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useContext } from "react";
import Modal from "@/components/Modal";
import { toast } from "sonner";

export default function ProductsModal({
  isOpen,
  onClose,
  onAdd,
  exclude,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: SalesOrderItem) => void;
  exclude?: Array<number>;
}) {
  const { store } = useContext(GlobalContext) || {};
  const [inventory, setInventory] = React.useState<Inventory[]>([]);
  const [value, setValue] = React.useState<Inventory | null>(null);
  const { salesOrderItemSchema } = validations;
  const form = useForm<z.infer<typeof salesOrderItemSchema>>({
    resolver: zodResolver(salesOrderItemSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 0,
    },
  });

  const items: Inventory[] = exclude
    ? inventory.filter((p) => !exclude?.includes(p.id))
    : inventory;

  async function onSubmit(values: z.infer<typeof salesOrderItemSchema>) {
    try {
      const item: SalesOrderItem = {
        ...values,
        inventory: inventory.find((p) => p.id === values.inventoryId),
      };

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
    const { data } = await inventoryServices.list();
    setInventory(data);
  };

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    if (store?.inventory) {
      setInventory(store.inventory as Inventory[]);
    }
  }, [store?.inventory]);

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
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Product</FormLabel>
                  <Autocomplete
                    value={value}
                    items={items}
                    valueKey={"product.name"}
                    placeholder="Product"
                    onChange={(value) => {
                      form.setValue("inventoryId", value.id);
                      form.setValue("inventory", value);
                      form.setValue("unitPrice", value?.price);
                      setValue(value);
                    }}
                  />
                  {value?.quantity && (
                    <FormDescription>
                      Stock:{" "}
                      <span className="font-semibold">{value.quantity}</span>
                    </FormDescription>
                  )}

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
