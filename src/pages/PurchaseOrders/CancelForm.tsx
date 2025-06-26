import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { cancelPurchaseOrderSchema } from "@/schemas";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { ApiError } from "@/services";
import * as z from "zod";

export default function CancelForm({ onSubmit }) {
  const form = useForm<z.infer<typeof cancelPurchaseOrderSchema>>({
    resolver: zodResolver(cancelPurchaseOrderSchema),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancel Order</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form className="mb-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm cancel order</AlertDialogTitle>
              <FormField
                control={form.control}
                name="cancellationReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation reason</FormLabel>
                    <FormControl>
                      <AlertDialogDescription className="grid w-full gap-2">
                        <Textarea
                          placeholder="Type your message here."
                          {...field}
                        />
                      </AlertDialogDescription>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(form.formState.errors);
                  form
                    .handleSubmit(onSubmit)(e)
                    .catch((error) => {
                      const { errors } = (
                        error as { response: { data: { errors: ApiError[] } } }
                      ).response.data;
                      errors.forEach((err: ApiError) => {
                        if (err.field) {
                          console.log(err.field);
                          form.setError(
                            err.field as keyof z.infer<
                              typeof cancelPurchaseOrderSchema
                            >,
                            {
                              type: "server",
                              message: err.message,
                            },
                          );
                        }
                      });
                    });
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
