import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formChangePasswordSchema } from "@/schemas";
import { DialogFooter } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { authServices } from "@/services";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import Modal from "../Modal";
import * as z from "zod";

export default function ChangePasswordModal({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) {
  const form = useForm<z.infer<typeof formChangePasswordSchema>>({
    resolver: zodResolver(formChangePasswordSchema),
  });

  const onSubmit = async (values: z.infer<typeof formChangePasswordSchema>) => {
    try {
      await authServices.changePassword(values);
      toast.success("Password changed successfully");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Error changing password");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Change Password"
      size="sm"
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              className="shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                console.log(form.getValues(), form.formState.errors);
                form
                  .handleSubmit(onSubmit)(e)
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
