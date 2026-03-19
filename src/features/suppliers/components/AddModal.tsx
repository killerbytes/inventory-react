import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ApiError,
  ApiErrorResponse,
  SupplierInput,
  supplierBaseSchema,
} from "@/schemas";
import { useCreateSupplier } from "../hooks/useSuppliers";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2Icon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ERROR } from "@/utils/definitions";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { toast } from "sonner";

export default function AddModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { mutate: createSupplier, isPending } = useCreateSupplier();
  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierBaseSchema),
  });

  const onSubmit = async (values: SupplierInput) => {
    const { name, address, contact, phone, email } = values;
    createSupplier(
      {
        name,
        address,
        contact,
        phone,
        email,
      },
      {
        onSuccess: () => {
          toast.success(`Submitted: ${values.name}`);
          form.reset();
          onClose();
        },
        onError: (error: unknown) => {
          const apiError = error as ApiErrorResponse;
          if (apiError.code === ERROR.VALIDATION_ERROR) {
            apiError.errors?.forEach((err: ApiError) => {
              if (err.field) {
                form.setError(err.field as keyof SupplierInput, {
                  type: "server",
                  message: err.message,
                });
              }
            });
          } else {
            toast.error("Submission failed");
          }
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Add Supplier"
      description="Add a new supplier to the system"
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contact"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button className="shadow-sm" type="submit" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : <Save />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
