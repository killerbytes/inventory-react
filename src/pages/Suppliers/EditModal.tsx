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
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { ApiErrorResponse, Supplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supplierServices } from "@/services";
import { ERROR } from "@/utils/definitions";
import { supplierSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import React from "react";

export default function EditModal({
  isOpen,
  onClose,
  cb,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
  data: Supplier;
}) {
  const [confirm, setConfirm] = React.useState(false);
  const form = useForm<Supplier>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { ...data },
  });

  async function onSubmit(values: Supplier) {
    try {
      await supplierServices.update(Number(data.id), values);
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof Supplier, {
              type: "server",
              message: err.message,
            });
          }
        });
      }
      toast.error("Submission failed");
    } finally {
      cb();
    }
  }

  const handleDelete = async () => {
    try {
      await supplierServices.delete(Number(data.id));
      toast.success(`Deleted: ${data.name}`);
      onClose();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors?.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof Supplier, {
              type: "server",
              message: err.message,
            });
          }
        });
      }
      toast.error("Deletion failed");
    } finally {
      cb();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Edit Supplier"
        description="Update the supplier details"
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
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact" {...field} />
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
                    <Input placeholder="Email" {...field} />
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
