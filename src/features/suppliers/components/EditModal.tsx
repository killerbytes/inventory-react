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
  ApiErrorResponse,
  Supplier,
  supplierBaseSchema,
  SupplierInput,
} from "@/schemas";
import { useDeleteSupplier, useUpdateSupplier } from "../hooks/useSuppliers";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ERROR } from "@/utils/definitions";
import { useForm } from "react-hook-form";
import SupplierForm from "./SupplierForm";
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
  data: Supplier;
}) {
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
  const [confirm, setConfirm] = React.useState(false);
  const form = useForm<SupplierInput>({
    resolver: zodResolver(supplierBaseSchema),
    defaultValues: { ...data },
  });

  const onSubmit = async (values: SupplierInput) => {
    updateSupplier(
      { id: Number(data.id), data: values },
      {
        onSuccess: () => {
          toast.success(`Submitted: ${values.name}`);
          form.reset();
          onClose();
        },
        onError: (error: unknown) => {
          const apiError = error as ApiErrorResponse;
          if (apiError.code === ERROR.VALIDATION_ERROR) {
            apiError.errors?.forEach((err) => {
              if (err.field) {
                form.setError(err.field as keyof SupplierInput, {
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
  };

  const handleDelete = async () => {
    deleteSupplier(Number(data.id), {
      onSuccess: () => {
        toast.success(`Deleted: ${data.name}`);
        onClose();
      },
      onError: (error: unknown) => {
        const apiError = error as ApiErrorResponse;
        if (apiError.code === ERROR.VALIDATION_ERROR) {
          apiError.errors?.forEach((err) => {
            if (err.field) {
              form.setError(err.field as keyof SupplierInput, {
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
            <SupplierForm form={form} />
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
              <Button className="shadow-sm" type="submit" disabled={isUpdating}>
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
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
