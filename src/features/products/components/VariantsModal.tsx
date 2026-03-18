import {
  useCreateVariantType,
  useDeleteVariantType,
  useUpdateVariantType,
  useVariantType,
} from "@/features/products/hooks/useVariants";
import VariantCopyTemplateModal from "@/components/modals/VariantCopyTemplateModal";
import VariantTemplatePickerDialog from "@/components/VariantTemplatePickerDialog";
import { ApiErrorResponse, VariantTypes, variantTypesSchema } from "@/schemas";
import VariantTypesForm from "@/components/forms/VariantTypesForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { data: variantTypes } = useVariantType(productId);
  const { mutate: createVariantType } = useCreateVariantType();
  const { mutate: updateVariantType } = useUpdateVariantType();
  const { mutate: deleteVariantType } = useDeleteVariantType();

  const [toggle, handleToggle] = useToggle({
    variantTemplatePicker: false,
  });
  const [selected, setSelected] = React.useState<VariantTypes>();
  const [shouldOpenComboModal, setShouldOpenComboModal] = React.useState(false);
  const form = useForm<VariantTypes>({
    defaultValues,
    resolver: zodResolver(variantTypesSchema),
  });

  const handleSubmit = async (values: VariantTypes) => {
    const onSuccess = (action: "create" | "update") => {
      toast.success(`Variant ${action}d successfully`);
      setSelected(undefined);
      form.reset(defaultValues);
      form.setFocus("name");
      setShouldOpenComboModal(true);
    };
    const onError = (error: unknown) => {
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
    };
    const payload = {
      ...values,
      productId: Number(productId),
    };
    if (values.id) {
      updateVariantType(
        { id: values.id, data: payload },
        {
          onSuccess: () => {
            onSuccess("update");
          },
          onError,
        },
      );
    } else {
      createVariantType(payload, {
        onSuccess: () => {
          onSuccess("create");
        },
        onError,
      });
    }
  };

  React.useEffect(() => {
    form.reset(selected);
    form.setFocus("name");
  }, [form, selected]);

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [form]);

  const handleDelete = async () => {
    deleteVariantType(Number(selected?.id), {
      onSuccess: () => {
        toast.success("Variant deleted successfully");
        setSelected(undefined);
        form.reset(defaultValues);
      },
      onError: (error: unknown) => {
        const apiError = error as ApiErrorResponse;
        toast.error("Deletion failed: " + apiError.message);
      },
    });
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
          {variantTypes &&
            variantTypes.map((v, index) => (
              <Badge
                variant="secondary"
                className={cx("cursor-pointer outline", {
                  "bg-orange-500 text-white": selected?.id === v.id,
                  "font-bold underline italic ": v.isBreakpackFilter,
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

          {selected && variantTypes?.includes(selected) && (
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
      <p>¼ ½ ¾</p>
    </Modal>
  );
}
