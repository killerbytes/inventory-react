import VariantCopyTemplateModal from "@/components/modals/VariantCopyTemplateModal";
import VariantTemplatePickerDialog from "@/components/VariantTemplatePickerDialog";
import VariantTypesForm from "@/components/forms/VariantTypesForm";
import { ApiErrorResponse, VariantTypes } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Save, Search } from "lucide-react";
import { variantTypesServices } from "@/services";
import { Button } from "@/components/ui/button";
import { variantTypesSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { ERROR } from "@/utils/definitions";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
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
  onClose: (shouldOpenComboModal: boolean) => void;
}) {
  const [toggle, handleToggle] = useToggle({
    variantTemplatePicker: false,
  });
  const [selected, setSelected] = React.useState<VariantTypes>();
  const [variantTypes, setVariantTypes] = React.useState<VariantTypes[]>([]);
  const [shouldOpenComboModal, setShouldOpenComboModal] = React.useState(false);
  const form = useForm<VariantTypes>({
    defaultValues,
    resolver: zodResolver(variantTypesSchema),
  });

  const handleSubmit = async (values: VariantTypes) => {
    try {
      const payload = {
        ...values,
        productId: Number(productId),
      };
      if (values.id) {
        await variantTypesServices.update(values.id, payload);
        toast.success("Variant updated successfully");
      } else {
        await variantTypesServices.create(payload);
        toast.success("Variant created successfully");
      }
      getData();
      setSelected(undefined);
      form.reset(defaultValues);
      form.setFocus("name");
      setShouldOpenComboModal(true);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof VariantTypes, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Submission failed: " + apiError.message);
      }
    }
  };

  React.useEffect(() => {
    form.reset(selected);
    form.setFocus("name");
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
      onOpenChange={() => onClose(shouldOpenComboModal)}
      title="Variants"
      description="Add variants to the product"
    >
      <div className="flex justify-between items-center">
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
            className={cx("shadow-sm", {
              "bg-orange-500 text-white": !selected,
            })}
            onClick={() => {
              form.reset(defaultValues);
              setSelected(undefined);
            }}
          >
            <PlusIcon />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap justify-start">
          <Button
            variant="outline"
            type="button"
            className="shadow-sm"
            onClick={() => {
              handleToggle({ variantTemplatePicker: true });
            }}
          >
            <Search />
          </Button>

          {selected && variantTypes.includes(selected) && (
            <Button
              variant="outline"
              className="shadow-sm"
              onClick={() => {
                handleToggle({
                  saveTemplateModal: true,
                });
              }}
              type="button"
            >
              <Save />
            </Button>
          )}
        </div>
      </div>
      <VariantTypesForm
        key={selected?.id}
        variantTypes={variantTypes}
        selected={selected}
        form={form}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
      <VariantTemplatePickerDialog
        isOpen={Boolean(toggle.variantTemplatePicker)}
        onSelect={setSelected}
        onClose={() => handleToggle({ variantTemplatePicker: false })}
      />

      {toggle.saveTemplateModal && selected && (
        <VariantCopyTemplateModal
          selected={selected}
          isOpen={toggle.saveTemplateModal}
          onClose={() => handleToggle({ saveTemplateModal: false })}
        />
      )}
    </Modal>
  );
}
