import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ApiError, ApiErrorResponse, Supplier } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supplierServices } from "@/services";
import { ERROR } from "@/utils/definitions";
import { supplierSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { useStore } from "@/stores";
import { toast } from "sonner";

export default function AddModal({
  isOpen,
  onClose,
  cb,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
}) {
  const { supplierState } = useStore();
  const form = useForm<Supplier>({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (values: Supplier) => {
    try {
      const { name, address, contact, phone, email } = values;
      await supplierServices.create({
        name,
        address,
        contact,
        phone,
        email,
      });
      supplierState.invalidate();
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err: ApiError) => {
          if (err.field) {
            console.log(err.field);
            form.setError(err.field as keyof Supplier, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed");
      }
    } finally {
      cb();
    }
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
            <Button className="shadow-sm" type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
