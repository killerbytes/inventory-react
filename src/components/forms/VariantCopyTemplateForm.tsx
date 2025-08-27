import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { variantTypesServices } from "@/services";
import { ApiError, VariantTypes } from "@/types";
import { DialogFooter } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

export default function VariantCopyTemplateForm({
  selected,
}: {
  selected: VariantTypes;
}) {
  const form = useForm<VariantTypes>({
    defaultValues: {
      isTemplate: true,
      values: selected.values,
    },
  });

  const onSubmitVariantTemplate = async (values: VariantTypes) => {
    try {
      const payload = {
        ...values,
        values: selected.values,
      };
      await variantTypesServices.create(payload);
      toast.success("Template saved successfully");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Error saving template " + apiError.message);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {selected?.values?.map((i) => <Badge>{i.value}</Badge>)}
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="Input Template Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            className="shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              console.log(form.getValues(), form.formState.errors);
              form
                .handleSubmit(onSubmitVariantTemplate)(e)
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
  );
}
