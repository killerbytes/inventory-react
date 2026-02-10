import { ApiErrorResponse, VariantTypes, variantTypesSchema } from "@/schemas";
import VariantTypesForm from "../forms/VariantTypesForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { variantTypesServices } from "@/services";
import { cx } from "class-variance-authority";
import { useForm } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import Modal from "../Modal";
import React from "react";

const defaultValues: VariantTypes = {
  name: "",
  values: [],
};

export default function VariantTemplateModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [variantTypes, setVariantTypes] = React.useState<VariantTypes[]>([]);
  const [selected, setSelected] = React.useState<VariantTypes>();
  const form = useForm<VariantTypes>({
    resolver: zodResolver(variantTypesSchema),
  });

  // const x = useWatch({
  //   control: form.control,
  //   name: "values",
  // });

  const getData = React.useCallback(async () => {
    try {
      const data = await variantTypesServices.getAll({ q: undefined });
      setVariantTypes(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Submission failed: " + apiError.message);
    }
  }, []);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    form.reset(selected);
  }, [form, selected]);

  const handleSubmit = async (values: VariantTypes) => {
    console.log(values);
    const payload = {
      ...values,
      isTemplate: true,
    };
    if (values.id) {
      await variantTypesServices.update(values.id, payload);
    } else {
      await variantTypesServices.create(payload);
    }
    getData();
  };

  const handleDelete = async () => {
    await variantTypesServices.delete(Number(selected?.id));
    form.reset(defaultValues);
    getData();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Variant Template"
      description="Manage variant templates"
    >
      <div className="flex flex-wrap gap-2">
        {variantTypes.map((v, index) => (
          <Badge
            variant="outline"
            className={cx("cursor-pointer ", {
              "bg-orange-500 text-white": selected?.id === v.id,
            })}
            key={index}
            onClick={() => {
              setSelected(v);
            }}
          >
            {v.name}
          </Badge>
        ))}
        <Button
          variant="outline"
          type="button"
          className={cx({ "bg-orange-500 text-white": !selected })}
          size={"sm"}
          onClick={() => {
            form.reset(defaultValues);
            setSelected(undefined);
          }}
        >
          <PlusIcon />
        </Button>
      </div>
      <VariantTypesForm
        form={form}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        selected={selected}
      />
      {/* {JSON.stringify(x)} */}
    </Modal>
  );
}
