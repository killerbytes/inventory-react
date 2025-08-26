import VariantTemplatePickerDialog from "@/components/VariantTemplatePickerDialog";
import VariantTypesForm from "@/components/forms/VariantTypesForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { variantTypesServices } from "@/services";
import { Button } from "@/components/ui/button";
import { variantTypesSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import Modal from "@/components/Modal";
import { VariantTypes } from "@/types";
import { toast } from "sonner";
import React from "react";

const defaultValues: VariantTypes = {
  name: "",
  values: [],
};
export default function VariantsModal({
  productId,
  isOpen,
  onClose,
}: {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const openState = React.useState(false);
  const [selected, setSelected] = React.useState<VariantTypes>();
  const [variantTypes, setVariantTypes] = React.useState<VariantTypes[]>([]);
  const form = useForm<VariantTypes>({
    defaultValues,
    resolver: zodResolver(variantTypesSchema),
  });

  const handleSubmit = async (form: VariantTypes) => {
    const payload = {
      ...form,
      productId: Number(productId),
    };
    if (form.id) {
      await variantTypesServices.update(form.id, payload);
      toast.success("Variant updated successfully");
    } else {
      await variantTypesServices.create(payload);
      toast.success("Variant created successfully");
    }
    getData();
  };

  React.useEffect(() => {
    form.reset(selected);
  }, [form, selected]);

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [form]);

  const getData = React.useCallback(async () => {
    if (!productId) return;
    const data = await variantTypesServices.get(productId);
    setVariantTypes(data);
  }, [productId]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleDelete = async () => {
    await variantTypesServices.delete(Number(selected?.id));
    form.reset(defaultValues);
    getData();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Variants"
      description="Add variants to the product"
    >
      <div className="flex gap-2 flex-wrap justify-start">
        {variantTypes.map((v, index) => (
          <Badge
            variant="secondary"
            className={cx("cursor-pointer outline", {
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
          type="button"
          variant="outline"
          size="sm"
          className={cx("shadow-sm", { "bg-orange-500 text-white": !selected })}
          onClick={() => {
            form.reset(defaultValues);
            setSelected(undefined);
          }}
        >
          <PlusIcon />
        </Button>
      </div>
      <VariantTypesForm
        key={selected?.id}
        selected={selected}
        form={form}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        onOpenVariantTemplatePicker={() => {
          openState[1](true);
        }}
      />
      <VariantTemplatePickerDialog
        openState={openState}
        onSelect={setSelected}
      />
    </Modal>
  );
}
