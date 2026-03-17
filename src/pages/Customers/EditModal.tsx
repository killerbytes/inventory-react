import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDeleteCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { ApiErrorResponse, Customer, customerSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ERROR } from "@/utils/definitions";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import React from "react";

export default function EditModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: Customer;
}) {
  const { mutate: updateCustomer } = useUpdateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const [confirm, setConfirm] = React.useState(false);
  const form = useForm<Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: { ...data },
  });

  async function onSubmit(values: Customer) {
    updateCustomer(
      { id: Number(data.id), data: values },
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
                form.setError(err.field as keyof Customer, {
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

  const handleDelete = async () => {
    await deleteCustomer(Number(data.id), {
      onSuccess: () => {
        toast.success(`Deleted: ${data.name}`);
        onClose();
      },
      onError: (error) => {
        const apiError = error as unknown as ApiErrorResponse;
        if (apiError.code === ERROR.VALIDATION_ERROR) {
          apiError.errors?.forEach((err) => {
            if (err.field) {
              form.setError(err.field as keyof Customer, {
                type: "server",
                message: err.message,
              });
            }
          });
        }
        toast.error("Deletion failed");
      },
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Edit Customer"
        description="Update the customer details"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log(form.getValues(), form.formState.errors);
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
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="mr-auto text-red-500 shadow-sm"
                onClick={() => {
                  setConfirm(true);
                }}
              >
                <Trash2 />
              </Button>
              <Button className="shadow-sm" type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
