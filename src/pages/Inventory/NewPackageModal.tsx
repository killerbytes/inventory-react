import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ApiError, Inventory, RepackageInventory } from "@/types";
import { UNIT, UNIT_OPTIONS } from "@/utils/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { repackageInventorySchema } from "@/schemas";
import { Textarea } from "@/components/ui/textarea";
import NumberInput from "@/components/NumberInput";
import { Button } from "@/components/ui/button";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import { toast } from "sonner";

export default function NewPackageModal({
  isOpen,
  onClose,
  onSubmit,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  data: Inventory | null | undefined;
}) {
  const { description, name } = data?.product ?? {};
  console.log(data);
  const form = useForm<RepackageInventory>({
    resolver: zodResolver(repackageInventorySchema),
    defaultValues: {
      parentId: data?.id,
      name,
      description,
      categoryId: data?.product?.categoryId,
      price: 99.99,
      pullOutQuantity: 1,
      repackQuantity: 12,
      unit: UNIT.PCS,
    },
  });

  const handleSubmit = async (values: RepackageInventory) => {
    try {
      console.log(values);
      await inventoryServices.repackage(values);
      toast.success(`Submitted: ${values.name}`);
      onSubmit();
    } catch (error) {
      const { errors, message } = getErrorMessage(error);
      errors?.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof RepackageInventory, {
            type: "server",
            message: err.message,
          });
        }
      });

      if (message) {
        toast.error(message);
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Repackage product"
        description={`Repackage ${name}`}
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              form
                .handleSubmit(handleSubmit)(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail Price</FormLabel>
                  <FormControl>
                    <NumberInput placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Select {...field} options={UNIT_OPTIONS}></Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pullOutQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pull-out Quantity</FormLabel>
                  <FormControl>
                    <Input placeholder="Pull-out Quantity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repackQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repack Quantity</FormLabel>
                  <FormControl>
                    <Input placeholder="Repack Quantity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Repack</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
