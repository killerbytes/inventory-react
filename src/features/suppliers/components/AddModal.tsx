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
import { Form } from "@/components/ui/form";
import { ERROR } from "@/utils/definitions";
import { useForm } from "react-hook-form";
import SupplierForm from "./SupplierForm";
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
          <SupplierForm form={form} />

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
