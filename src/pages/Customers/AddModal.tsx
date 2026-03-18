import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ApiErrorResponse,
  CustomerInput,
  customerInputSchema,
} from "@/schemas";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
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
  const { mutate: createCustomer } = useCreateCustomer();
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerInputSchema),
    defaultValues: {},
  });

  async function onSubmit(values: CustomerInput) {
    const { name, address, contact, phone, email } = values;
    createCustomer(
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
        onError: (error) => {
          const apiError = error as unknown as ApiErrorResponse;
          if (apiError.code === ERROR.VALIDATION_ERROR) {
            apiError.errors?.forEach((err) => {
              if (err.field) {
                form.setError(err.field as keyof CustomerInput, {
                  type: "server",
                  message: err.message,
                });
              }
            });
          }
          toast.error("Submission failed");
        },
      },
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Add Customer"
      description="Add a new customer to the system"
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
            <Button className="shadow-sm" type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
